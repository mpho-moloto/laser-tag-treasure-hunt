import { Server, Socket } from "socket.io";
import { createLobby, joinLobby, handleShoot, handlePurchase, startGame, 
         lobbies, getAvailableLobbies, leaveLobby, setPlayerReady, 
         handleReload, handleWeaponSwitch, getGameTimeRemaining } from "./gameLogic";
import { Player, Weapon } from "../src/utils/constants";

export function setupSockets(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    const sendAvailableLobbies = () => {
      const available = getAvailableLobbies();
      console.log(`📊 Sending ${available.length} available lobbies`);
      io.emit("available-lobbies", available);
    };

    sendAvailableLobbies();

    socket.on("get-lobbies", sendAvailableLobbies);

    socket.on("create-lobby", (data: { player: Player; name: string }) => {
      console.log("🎯 Create lobby request from:", data.player.name);
      const { player, name } = data;

      const lobbyId = Math.floor(1000 + Math.random() * 9000);
      const lobbyState = createLobby(player, lobbyId, name);
      
      if (lobbyState) {
        console.log("✅ Lobby created successfully:", lobbyId);
        socket.join(`lobby-${lobbyId}`);
        io.to(`lobby-${lobbyId}`).emit("lobby-update", lobbyState.lobby);
        sendAvailableLobbies();
      } else {
        socket.emit("lobby-error", "Failed to create lobby");
      }
    });

    socket.on("join-lobby", (data: { player: Player; lobbyId: number }) => {
      console.log("👥 Join lobby request:", data.player.name, "to lobby:", data.lobbyId);
      const { player, lobbyId } = data;
      const lobbyState = joinLobby(player, lobbyId);
      
      if (lobbyState) {
        socket.join(`lobby-${lobbyId}`);
        io.to(`lobby-${lobbyId}`).emit("lobby-update", lobbyState.lobby);
        sendAvailableLobbies();
      } else {
        socket.emit("lobby-error", "Failed to join lobby - it may be full or not exist");
      }
    });

    socket.on("leave-lobby", (data: { playerId: number; lobbyId: number }) => {
      console.log("🚪 Leave lobby request:", data.playerId, "from lobby:", data.lobbyId);
      const { playerId, lobbyId } = data;
      
      const lobbyState = leaveLobby(playerId, lobbyId);
      socket.leave(`lobby-${lobbyId}`);
      
      if (lobbyState) {
        io.to(`lobby-${lobbyId}`).emit("lobby-update", lobbyState.lobby);
      }
      sendAvailableLobbies();
    });

    socket.on("player-ready", (data: { playerId: number; lobbyId: number; isReady: boolean }) => {
      console.log("✅ Player ready:", data.playerId, "ready:", data.isReady);
      const { playerId, lobbyId, isReady } = data;
      
      const lobbyState = setPlayerReady(playerId, lobbyId, isReady);
      if (lobbyState) {
        io.to(`lobby-${lobbyId}`).emit("lobby-update", lobbyState.lobby);
      }
    });

    socket.on("spectate-lobby", (data: { lobbyId: number }) => {
      console.log("👁️ Spectate lobby request:", data.lobbyId);
      const { lobbyId } = data;
      socket.join(`spectator-${lobbyId}`);
      const lobbyState = lobbies[lobbyId];
      
      if (lobbyState) {
        socket.emit("spectator-data", lobbyState);
        if (lobbyState.active) {
          socket.emit("game-started", lobbyState);
        }
      }
    });

    socket.on("start-game", (data: { lobbyId: number }) => {
      console.log("🚀 Start game request for lobby:", data.lobbyId);
      const { lobbyId } = data;
      const updatedLobby = startGame(lobbyId);
      
      if (updatedLobby) {
        io.to(`lobby-${lobbyId}`).emit("game-started", updatedLobby);
        io.to(`spectator-${lobbyId}`).emit("game-started", updatedLobby);
        sendAvailableLobbies();
      }
    });

    socket.on("shoot", (data: { playerId: number; targetColor: string; lobbyId: number }) => {
      const { playerId, targetColor, lobbyId } = data;
      const updatedLobby = handleShoot(playerId, targetColor, lobbyId);
      
      if (updatedLobby) {
        io.to(`lobby-${lobbyId}`).emit("game-update", updatedLobby);
        io.to(`spectator-${lobbyId}`).emit("game-update", updatedLobby);

        // Check for game end after each shot
        const alivePlayers = updatedLobby.lobby.players.filter(p => p.lives > 0);
        if (alivePlayers.length <= 1) {
          io.to(`lobby-${lobbyId}`).emit("game-over");
          io.to(`spectator-${lobbyId}`).emit("game-over");
          setTimeout(sendAvailableLobbies, 3000);
        }
      }
    });

    socket.on("reload-weapon", (data: { playerId: number; lobbyId: number }) => {
      const { playerId, lobbyId } = data;
      const updatedLobby = handleReload(playerId, lobbyId);
      
      if (updatedLobby) {
        io.to(`lobby-${lobbyId}`).emit("game-update", updatedLobby);
      }
    });

    socket.on("switch-weapon", (data: { playerId: number; weaponName: string; lobbyId: number }) => {
      const { playerId, weaponName, lobbyId } = data;
      const updatedLobby = handleWeaponSwitch(playerId, weaponName, lobbyId);
      
      if (updatedLobby) {
        io.to(`lobby-${lobbyId}`).emit("game-update", updatedLobby);
      }
    });

    socket.on("purchase", (data: { playerId: number; type: "weapon" | "life" | "powerup"; item: Weapon | undefined; lobbyId: number }) => {
      const { playerId, type, item, lobbyId } = data;
      const updatedLobby = handlePurchase(playerId, type, item, lobbyId);
      
      if (updatedLobby) {
        io.to(`lobby-${lobbyId}`).emit("game-update", updatedLobby);
        io.to(`spectator-${lobbyId}`).emit("game-update", updatedLobby);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      // Clean up any lobbies this player was in
      Object.entries(lobbies).forEach(([lobbyId, lobbyState]) => {
        const playerInLobby = lobbyState.lobby.players.find(p => p.id === parseInt(socket.id));
        if (playerInLobby) {
          leaveLobby(playerInLobby.id, parseInt(lobbyId));
          io.to(`lobby-${lobbyId}`).emit("lobby-update", lobbyState.lobby);
        }
      });
      sendAvailableLobbies();
    });
  });

  // Game timer check
  setInterval(() => {
    Object.entries(lobbies).forEach(([lobbyId, lobbyState]) => {
      if (lobbyState.active) {
        const timeRemaining = getGameTimeRemaining(Number(lobbyId));
        
        if (timeRemaining <= 0) {
          lobbyState.active = false;
          lobbyState.lobby.state = "finished";
          io.to(`lobby-${lobbyId}`).emit("game-over");
          io.to(`spectator-${lobbyId}`).emit("game-over");
        }
      }
    });
  }, 1000);
}