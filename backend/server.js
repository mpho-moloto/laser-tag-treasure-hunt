// Student Number: 2023094242
// Student Number: 2019042973

// server.js
import express from 'express';
import { createServer } from 'http';
import BattleServer from './websocket/BattleServer.js';

const app = express();
const server = createServer(app);
const battleServer = new BattleServer(server); // Initialize WebSocket battle server

app.use(express.static('public')); // Serve static files from public directory

// Root route - server status page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Laser Tag Arena Server</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: #0a0a0a; 
            color: #00f3ff; 
            text-align: center; 
            padding: 50px;
          }
          h1 { text-shadow: 0 0 10px #00f3ff; }
          .status { 
            background: rgba(0, 243, 255, 0.1); 
            padding: 20px; 
            border-radius: 10px; 
            margin: 20px auto; 
            max-width: 500px;
          }
        </style>
      </head>
      <body>
        <h1>🎯 Last Lap Server</h1>
        <div class="status">
          <h2>✅ Server is running!</h2>
          <p>WebSocket available at: <strong>ws://localhost:4000</strong></p>
          <p>Ready for battle connections...</p>
        </div>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 4000; // Use environment port or default to 4000
server.listen(PORT, () => {
  console.log(`🎯 Last Lap Server running on port ${PORT}`);
  console.log(`🔗 WebSocket: ws://localhost:${PORT}`);
  console.log(`🌐 HTTP: http://localhost:${PORT}`);
});

export default server;