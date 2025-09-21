"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSockets = setupSockets;
const gameLogic_1 = require("./gameLogic");
function setupSockets(io) {
    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);
        // Player joins lobby - expects single data object
        socket.on("join-lobby", (data) => {
            const { player, lobbyId } = data;
            const updatedLobby = (0, gameLogic_1.joinLobby)(player, lobbyId);
            socket.join(`lobby-${lobbyId}`);
            io.to(`lobby-${lobbyId}`).emit("lobby-update", updatedLobby);
        });
        // Spectator joins lobby - ADDED
        socket.on("spectate-lobby", (data) => {
            const { lobbyId } = data;
            socket.join(`spectator-${lobbyId}`);
            // Send current game state to spectator
            const lobbyState = gameLogic_1.lobbies[lobbyId];
            if (lobbyState) {
                socket.emit("spectator-data", lobbyState);
            }
        });
        // Start game - FIXED: Now expects data object instead of just lobbyId
        socket.on("start-game", (data) => {
            const { lobbyId } = data;
            const updatedLobby = (0, gameLogic_1.startGame)(lobbyId);
            if (updatedLobby) {
                io.to(`lobby-${lobbyId}`).emit("game-started", updatedLobby);
                io.to(`spectator-${lobbyId}`).emit("game-started", updatedLobby); // Also update spectators
            }
        });
        // Player shooting - expects single data object
        socket.on("shoot", (data) => {
            const { playerId, targetColor, lobbyId } = data;
            const updatedLobby = (0, gameLogic_1.handleShoot)(playerId, targetColor, lobbyId);
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
        socket.on("purchase", (data) => {
            const { playerId, type, item, lobbyId } = data;
            const updatedLobby = (0, gameLogic_1.handlePurchase)(playerId, type, item, lobbyId);
            if (updatedLobby) {
                io.to(`lobby-${lobbyId}`).emit("game-update", updatedLobby);
                io.to(`spectator-${lobbyId}`).emit("game-update", updatedLobby); // Also update spectators
            }
        });
        // --- ADDITIONAL EVENTS FOR GAME FUNCTIONALITY ---
        // Send all available lobbies to client
        socket.on("get-lobbies", () => {
            socket.emit("available-lobbies", Object.values(gameLogic_1.lobbies).map(l => l.lobby));
        });
        // Handle player leaving a lobby
        socket.on("leave-lobby", (data) => {
            const { playerId, lobbyId } = data;
            const lobbyState = gameLogic_1.lobbies[lobbyId];
            if (lobbyState) {
                // Remove player from lobby
                lobbyState.lobby.players = lobbyState.lobby.players.filter(p => p.id !== playerId);
                // If lobby is empty, delete it
                if (lobbyState.lobby.players.length === 0) {
                    delete gameLogic_1.lobbies[lobbyId];
                }
                else {
                    io.to(`lobby-${lobbyId}`).emit("lobby-update", lobbyState);
                }
                // Notify all clients of available lobbies
                io.emit("available-lobbies", Object.values(gameLogic_1.lobbies).map(l => l.lobby));
            }
            socket.leave(`lobby-${lobbyId}`);
        });
        // Handle spectator leaving a lobby
        socket.on("leave-spectator", (data) => {
            const { lobbyId } = data;
            socket.leave(`spectator-${lobbyId}`);
        });
        // Handle disconnection
        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
}
