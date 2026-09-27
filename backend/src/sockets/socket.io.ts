import { Server, Socket } from "socket.io";
import type { Types } from "mongoose";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { randomUUID } from "crypto";
import userModel from "../models/user.model";
import chatModel from "../models/chat.model";
import { aiInteraction, aiEmbedding } from "../services/ai.service";
import messageModel from "../models/message.model";
import { createMemory, queryMemory } from "../services/vector.service";

type AIMessage = {
  chatId: string;
  content: string;
};

type ChatHistoryRequest = {
  chatId: string;
};

type AuthenticatedSocket = Socket & {
  user: { _id: Types.ObjectId };
};

const initSocketServer = (io: Server) => {
  io.use(async (socket, next) => {
    const cookies = cookie.parseCookie(socket.handshake.headers.cookie ?? "");

    const token = cookies.token;

    if (!token) {
      return next(new Error("No token provided"));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as jwt.JwtPayload;

      const user = await userModel.findById(decoded._id);

      if (!user) {
        return next(new Error("User not found"));
      }

      (socket as AuthenticatedSocket).user = user;

      next();
    } catch (error) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("get-chat-history", async (request: ChatHistoryRequest) => {
      const user = (socket as AuthenticatedSocket).user;

      if (!request || typeof request.chatId !== "string") {
        socket.emit("chat-history-error", {
          chatId: request?.chatId ?? "",
          message: "A valid conversation is required",
        });
        return;
      }

      try {
        const chat = await chatModel.findOne({
          _id: request.chatId,
          user: user._id,
        });

        if (!chat) {
          socket.emit("chat-history-error", {
            chatId: request.chatId,
            message: "Conversation not found",
          });
          return;
        }

        const messages = await messageModel
          .find({ chatId: chat._id, userId: user._id })
          .sort({ createdAt: 1 })
          .select("_id content role createdAt")
          .lean();

        socket.emit("chat-history", {
          chatId: request.chatId,
          messages: messages.map((message) => ({
            _id: message._id.toString(),
            content: message.content,
            role: message.role,
          })),
        });
      } catch (error) {
        console.error("Unable to load chat history:", error);
        socket.emit("chat-history-error", {
          chatId: request.chatId,
          message: "Unable to load this conversation",
        });
      }
    });

    socket.on("ai-message", async (message: AIMessage) => {
      const user = (socket as AuthenticatedSocket).user;

      if (
        !message ||
        typeof message.chatId !== "string" ||
        typeof message.content !== "string" ||
        !message.content.trim()
      ) {
        socket.emit("ai-error", "A valid chat message is required");
        return;
      }

      let chat;
      try {
        chat = await chatModel.findOne({
          _id: message.chatId,
          user: user._id,
        });
      } catch (error) {
        console.error("Unable to verify chat ownership:", error);
        socket.emit("ai-error", "Unable to access this conversation");
        return;
      }

      if (!chat) {
        socket.emit("ai-error", "Conversation not found");
        return;
      }

      /*
      const UserMessage = await messageModel.create({
        userId: user._id,
        chatId: message.chatId,
        content: message.content,
        role: "user",
      });

      const embedding = await aiEmbedding(message.content);
      
   */

      const [, embedding] = await Promise.all([
        messageModel.create({
          userId: user._id,
          chatId: message.chatId,
          content: message.content,
          role: "user",
        }),
        aiEmbedding(message.content),
      ]);

      if (!embedding) {
        socket.emit("ai-error", "Unable to generate an embedding");
        return;
      }

      const memory = await queryMemory(embedding);

      await createMemory(embedding, randomUUID(), {
        userId: user._id,
        chatId: message.chatId,
        content: message.content,
        role: "user",
      });

      try {
        const memoryText = await messageModel
          .find({ chatId: message.chatId })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean();

        const shortTermMemory = memoryText
          .map((item) => `${item.role}: ${item.content}`)
          .join("\n");

        const longTermMemory = memory
          .map((item) => item.metadata?.content)
          .filter((content): content is string => typeof content === "string")
          .join("\n");

        const aiInput = `You are a helpful assistant that answers questions. 
        
        Short-term conversation memory:${shortTermMemory || "(none)"}
        Long-term relevant memory:${longTermMemory || "(none)"}
        Current user question:${message.content}`;

        const aiResponse = await aiInteraction(aiInput);

        await messageModel.create({
          userId: user._id,
          chatId: message.chatId,
          content: aiResponse,
          role: "model",
        });

        if (!aiResponse) {
          socket.emit("ai-error", "Unable to generate a response");
          return;
        }

        const aiResponseEmbedding = await aiEmbedding(aiResponse);

        if (!aiResponseEmbedding) {
          socket.emit("ai-error", "Unable to generate an aiResponseEmbedding");
          return;
        }

        await createMemory(aiResponseEmbedding, randomUUID(), {
          userId: user._id,
          chatId: message.chatId,
          content: aiResponse,
          role: "model",
        });

        socket.emit("ai-response", {
          chatId: message.chatId,
          content: aiResponse,
        });
      } catch (error) {
        console.error("AI request failed:", error);
        socket.emit("ai-error", "Unable to generate a response");
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });
};

export default initSocketServer;
