import { Response, Request } from "express";
import chatModel from "../models/chat.model";

export const createChat = async (req: Request, res: Response) => {
  const { message } = req.body;

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ message: "A chat title is required" });
  }

  const userId = (req as Request & { user: { _id: string } }).user._id;

  const createdChat = await chatModel.create({
    user: userId,
    title: message.trim(),
  });

  return res.status(201).json(createdChat);
};

export const getChats = async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { _id: string } }).user._id;
  const chats = await chatModel
    .find({ user: userId })
    .sort({ updatedAt: -1 })
    .lean();

  return res.status(200).json(chats);
};
