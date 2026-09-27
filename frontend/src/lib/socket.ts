import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const socketUrl = new URL(apiUrl).origin;

export const socket = io(socketUrl, {
  autoConnect: false,
  withCredentials: true,
});
