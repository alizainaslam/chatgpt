import { Router } from "express";
import { createChat, getChats } from "../controllers/chat.controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

const chatRoutes = Router();

chatRoutes.get("/", authMiddleware, getChats);
chatRoutes.post("/", authMiddleware, createChat);

export default chatRoutes;
