import dotenv from "dotenv";
dotenv.config();
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes";
import chatRouter from "./routes/chat.routes";
import connectDB from "./db/connect.db";

const app: Express = express();

// Connect to MongoDB
connectDB();


// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());


// Routes
app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);


export default app;
