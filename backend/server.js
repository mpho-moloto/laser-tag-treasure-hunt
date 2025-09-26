// Student Number: 2023094242
// Student Number: 2019042973

// Entry point for the Laser Tag Arena backend server. Sets up an Express server to serve static files
// and a WebSocket server for real-time game communication using the BattleServer class.
import express from 'express';
import { createServer } from 'http';
import BattleServer from './websocket/BattleServer.js';

const app = express(); // Create an Express application
const server = createServer(app); // Create an HTTP server using Express
const battleServer = new BattleServer(server); // Attach the WebSocket BattleServer to the HTTP server

// Serve static files from the 'public' directory (e.g., frontend assets)
app.use(express.static('public'));

// Define a simple homepage for the server root
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

// Start the HTTP and WebSocket server on the specified port (default 4000)
const PORT = process.env.PORT || 4000; // Use environment port or default to 4000
server.listen(PORT, () => {
  console.log(`🎯 Last Lap Server running on port ${PORT}`);
  console.log(`🔗 WebSocket: ws://localhost:${PORT}`);
  console.log(`🌐 HTTP: http://localhost:${PORT}`);
});

// Export the server for potential external use
export default server;