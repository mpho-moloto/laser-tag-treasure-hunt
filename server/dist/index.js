"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const sockets_1 = require("./sockets");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Update CORS to allow Vercel domain
const allowedOrigins = [
    "http://localhost:3000",
    "https://lasertag-ten.vercel.app", //Vercel URL
    process.env.CLIENT_URL
].filter((origin) => typeof origin === "string");
// Middleware
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express_1.default.json());
const io = new socket_io_1.Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});
// Setup socket.io connections
(0, sockets_1.setupSockets)(io);
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
