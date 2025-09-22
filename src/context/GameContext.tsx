import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import io from "socket.io-client";
import { Player, Lobby, Weapon, GameState as GameStateType } from "../utils/constants";

interface Socket {
  id: string;
  connected: boolean;
  disconnect(): void;
  on(event: string, callback: (data: any) => void): void;
  emit(event: string, data: any): void;
  off(event: string, callback?: (data: any) => void): void;
}

interface GameContextType {
  player: Player | null;
  setPlayer: (player: Player) => void;
  currentLobby: Lobby | null;
  availableLobbies: Lobby[];
  gameState: GameStateType | null;
  isGameActive: boolean;
  socket: Socket | null;
  currentView: string;
  setCurrentView: (view: string) => void;
  createLobby: (name: string) => void;
  joinLobby: (lobbyId: number) => void;
  startGame: () => void;
  shoot: (targetColor: string) => void;
  purchaseItem: (type: "weapon" | "life" | "powerup", item?: Weapon) => void;
  reloadWeapon: () => void;
  spectateLobby: (lobbyId: number) => void;
  error: string;
  setError: (error: string) => void;
  leaveLobby: () => void;
  playerReady: (isReady: boolean) => void;
  switchWeapon: (weaponName: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
};

interface GameProviderProps { children: ReactNode }

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [currentLobby, setCurrentLobby] = useState<Lobby | null>(null);
  const [availableLobbies, setAvailableLobbies] = useState<Lobby[]>([]);
  const [gameState, setGameState] = useState<GameStateType | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentView, setCurrentView] = useState("login");
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("🔄 Initializing socket connection...");
    const newSocket = io(process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5003");
    setSocket(newSocket);

    // Connection events
    newSocket.on("connect", () => {
      console.log("✅ Connected to server");
      setError("");
    });

    newSocket.on("connect_error", (error: Error) => {
      console.error("❌ Connection error:", error);
      setError("Failed to connect to server. Please check if server is running.");
    });

    // Lobby updates
    newSocket.on("lobby-update", (lobby: Lobby) => {
      console.log("📋 Lobby update received:", lobby.id, lobby.name, "State:", lobby.state);
      setCurrentLobby(lobby);
      setError("");
    });

    newSocket.on("available-lobbies", (lobbies: Lobby[]) => {
      console.log("📊 Available lobbies:", lobbies.length);
      setAvailableLobbies(lobbies);
    });

    newSocket.on("game-started", (state: GameStateType) => {
      console.log("🎮 Game started!");
      setGameState(state);
      setIsGameActive(true);
      setCurrentView("game");
    });

    newSocket.on("game-update", (state: GameStateType) => {
      setGameState(state);
    });

    newSocket.on("game-over", () => {
      console.log("🏆 Game over");
      setIsGameActive(false);
      setCurrentView("winner");
    });

    newSocket.on("lobby-error", (errorMessage: string) => {
      console.error("❌ Lobby error:", errorMessage);
      setError(errorMessage);
    });

    // NEW: Handle player disconnects from lobby
    newSocket.on("player-left", (data: { playerId: number; lobbyId: number }) => {
      console.log("🚪 Player left lobby:", data.playerId);
      if (currentLobby && currentLobby.id === data.lobbyId) {
        setCurrentLobby(prev => prev ? {
          ...prev,
          players: prev.players.filter(p => p.id !== data.playerId)
        } : null);
      }
    });

    // Request initial lobbies
    newSocket.emit("get-lobbies");

    return () => {
      console.log("🧹 Cleaning up socket connection");
      if (currentLobby && player) {
        newSocket.emit("leave-lobby", { 
          playerId: player.id, 
          lobbyId: currentLobby.id 
        });
      }
      newSocket.disconnect();
    };
  }, []);

  const createLobby = (name: string) => {
    if (!player || !socket) {
      setError("Not connected to server");
      return;
    }

    if (!name.trim()) {
      setError("Please enter a lobby name");
      return;
    }

    console.log("🎯 Creating lobby:", name);
    setError("");

    socket.emit("create-lobby", { player, name });
  };

  const joinLobby = (lobbyId: number) => {
    if (!player || !socket) {
      setError("Not connected to server");
      return;
    }

    console.log("👥 Joining lobby:", lobbyId);
    setError("");
    socket.emit("join-lobby", { player, lobbyId });
  };

  const leaveLobby = () => {
    if (!player || !currentLobby || !socket) return;
    
    socket.emit("leave-lobby", { 
      playerId: player.id, 
      lobbyId: currentLobby.id 
    });
    
    setCurrentLobby(null);
    setCurrentView("lobby");
  };

  const playerReady = (isReady: boolean) => {
    if (!player || !currentLobby || !socket) return;
    
    socket.emit("player-ready", {
      playerId: player.id,
      lobbyId: currentLobby.id,
      isReady
    });
  };

  const spectateLobby = (lobbyId: number) => {
    if (!socket) {
      setError("Not connected to server");
      return;
    }

    console.log("👁️ Spectating lobby:", lobbyId);
    setError("");
    socket.emit("spectate-lobby", { lobbyId });
    setCurrentView("spectator");
  };

  const startGame = () => {
    if (!currentLobby || !socket) {
      setError("Not in a lobby");
      return;
    }

    if (currentLobby.players.length < 2) {
      setError("Need at least 2 players to start");
      return;
    }

    // NEW: Only allow starting from pregame state
    if (currentLobby.state !== "pregame") {
      setError("Game can only be started from preparation phase");
      return;
    }

    console.log("🚀 Starting game");
    setError("");
    socket.emit("start-game", { lobbyId: currentLobby.id });
  };

  const shoot = (targetColor: string) => {
    if (!player || !currentLobby || !socket) return;
    
    // NEW: Only allow shooting in active state
    if (currentLobby.state !== "active") {
      setError("Game is not active");
      return;
    }
    
    socket.emit("shoot", { playerId: player.id, targetColor, lobbyId: currentLobby.id });
  };

  const purchaseItem = (type: "weapon" | "life" | "powerup", item?: Weapon) => {
    if (!player || !currentLobby || !socket) return;
    
    // NEW: Only allow purchases in pregame state
    if (currentLobby.state !== "pregame") {
      setError("Purchases only allowed in preparation phase");
      return;
    }
    
    socket.emit("purchase", { playerId: player.id, type, item, lobbyId: currentLobby.id });
  };

  const reloadWeapon = () => {
    if (!player || !currentLobby || !socket) return;
    
    // NEW: Only allow reloading in active state
    if (currentLobby.state !== "active") {
      setError("Game is not active");
      return;
    }
    
    socket.emit("reload-weapon", { 
      playerId: player.id, 
      lobbyId: currentLobby.id 
    });
  };

  const switchWeapon = (weaponName: string) => {
    if (!player || !currentLobby || !socket) return;
    
    // NEW: Allow weapon switching in both pregame and active states
    if (currentLobby.state !== "pregame" && currentLobby.state !== "active") {
      setError("Cannot switch weapons now");
      return;
    }
    
    socket.emit("switch-weapon", { 
      playerId: player.id, 
      weaponName, 
      lobbyId: currentLobby.id 
    });
  };

  const value: GameContextType = {
    player,
    setPlayer,
    currentLobby,
    availableLobbies,
    gameState,
    isGameActive,
    socket,
    currentView,
    setCurrentView,
    createLobby,
    joinLobby,
    startGame,
    shoot,
    purchaseItem,
    reloadWeapon,
    spectateLobby,
    error,
    setError,
    leaveLobby,
    playerReady,
    switchWeapon
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};