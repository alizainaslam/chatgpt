import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import initSocketServer from "./sockets/socket.io";

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  },
});

initSocketServer(io);

const port = Number(process.env.PORT) || 3000;

httpServer.listen(port, () => {
  console.log(`API and Socket.IO listening on http://localhost:${port}`);
});
