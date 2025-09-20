import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { setupSockets } from "./sockets";

const app = express();
const server = http.createServer(app);

// Update CORS to allow Vercel domain
const allowedOrigins = [
  "http://localhost:3000",
  "https://lasertag-ten.vercel.app", //Vercel URL
  process.env.CLIENT_URL
].filter((origin): origin is string => typeof origin === "string");

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Setup socket.io connections
setupSockets(io);

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Laser Tag Server Running!" });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Laser Tag Server Running!" });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});