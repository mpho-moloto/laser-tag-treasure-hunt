// server.js
import express from 'express';
import { createServer } from 'http';
import BattleServer from './websocket/BattleServer.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// ------------------------------
// Setup __dirname for ES modules
// ------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------
// Create Express app
// ------------------------------
const app = express();
const server = createServer(app);

// ------------------------------
// Middleware
// ------------------------------
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON requests

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// ------------------------------
// Fallback route for SPA (React Router)
// ------------------------------
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// ------------------------------
// Start BattleServer (WebSocket)
// ------------------------------
new BattleServer(server);

// ------------------------------
// Start HTTP server
// ------------------------------
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🎮 Laser Tag Arena ready!`);
});
