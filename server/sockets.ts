// server/sockets.ts
import { Server, Socket } from "socket.io";
import { joinLobby, handleShoot, handlePurchase, startGame, lobbies } from "./gameLogic";
import { Player, Weapon } from "../src/utils/constants";


export function setupSockets(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Player joins lobby - expects single data object
    socket.on("join-lobby", (data: { player: Player, lobbyId: number }) => {
      const { player, lobbyId } = data;
      const updatedLobby = joinLobby(player, lobbyId);
      socket.join(`lobby-${lobbyId}`);
      io.to(`lobby-${lobbyId}`).emit("lobby-update", updatedLobby);
    });

    // Spectator joins lobby - ADDED
    socket.on("spectate-lobby", (data: { lobbyId: number }) => {
      const { lobbyId } = data;
      socket.join(`spectator-${lobbyId}`);
      
      // Send current game state to spectator
      const lobbyState = lobbies[lobbyId];
      if (lobbyState) {
        socket.emit("spectator-data", lobbyState);
      }
    });

    // Start game - FIXED: Now expects data object instead of just lobbyId
    socket.on("start-game", (data: { lobbyId: number }) => {
      const { lobbyId } = data;
      const updatedLobby = startGame(lobbyId);
      if (updatedLobby) {
        io.to(`lobby-${lobbyId}`).emit("game-started", updatedLobby);
        io.to(`spectator-${lobbyId}`).emit("game-started", updatedLobby); // Also update spectators
      }
    });

    // Player shooting - expects single data object
    socket.on("shoot", (data: { playerId: number, targetColor: string, lobbyId: number }) => {
      const { playerId, targetColor, lobbyId } = data;
      const updatedLobby = handleShoot(playerId, targetColor, lobbyId);
      if (updatedLobby) {
        io.to(`lobby-${lobbyId}`).emit("game-update", updatedLobby);
        io.to(`spectator-${lobbyId}`).emit("game-update", updatedLobby); // Also update spectators
        
        // Check for winner
        const winner = updatedLobby.lobby.players.find(p => p.lives > 0);
        if (updatedLobby.lobby.players.filter(p => p.lives > 0).length === 1 && winner) {
          io.to(`lobby-${lobbyId}`).emit("game-over", winner);
          io.to(`spectator-${lobbyId}`).emit("game-over", winner); // Also update spectators
        }
      }
    });

    // Player purchases - expects single data object
    socket.on("purchase", (data: { 
      playerId: number, 
      type: "weapon" | "life" | "powerup", 
      item: Weapon | undefined, 
      lobbyId: number 
    }) => {
      const { playerId, type, item, lobbyId } = data;
      const updatedLobby = handlePurchase(playerId, type, item, lobbyId);
      if (updatedLobby) {
        io.to(`lobby-${lobbyId}`).emit("game-update", updatedLobby);
        io.to(`spectator-${lobbyId}`).emit("game-update", updatedLobby); // Also update spectators
      }
    });

    // --- ADDITIONAL EVENTS FOR GAME FUNCTIONALITY ---
    // Send all available lobbies to client
    socket.on("get-lobbies", () => {
      socket.emit("available-lobbies", Object.values(lobbies).map(l => l.lobby));
    });

    // Handle player leaving a lobby
    socket.on("leave-lobby", (data: { playerId: number, lobbyId: number }) => {
      const { playerId, lobbyId } = data;
      const lobbyState = lobbies[lobbyId];
      if (lobbyState) {
        // Remove player from lobby
        lobbyState.lobby.players = lobbyState.lobby.players.filter(p => p.id !== playerId);
        // If lobby is empty, delete it
        if (lobbyState.lobby.players.length === 0) {
          delete lobbies[lobbyId];
        } else {
          io.to(`lobby-${lobbyId}`).emit("lobby-update", lobbyState);
        }
        // Notify all clients of available lobbies
        io.emit("available-lobbies", Object.values(lobbies).map(l => l.lobby));
      }
      socket.leave(`lobby-${lobbyId}`);
    });

    // Handle spectator leaving a lobby
    socket.on("leave-spectator", (data: { lobbyId: number }) => {
      const { lobbyId } = data;
      socket.leave(`spectator-${lobbyId}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}