import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { setupSockets } from "./sockets";

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Setup socket.io connections
setupSockets(io);

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Laser Tag Server Running!" });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});