import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import io from "socket.io-client";
import { Player, Lobby, Weapon, GameState as GameStateType } from "../../server/types";

// Add this type definition
interface Socket {
  id: string;
  connected: boolean;
  disconnect(): void;
  on(event: string, callback: (data: any) => void): void;
  emit(event: string, data: any): void;
  off(event: string, callback?: (data: any) => void): void;
}

interface GameContextType {
  // Player state
  player: Player | null;
  setPlayer: (player: Player) => void;
  
  // Lobby state
  currentLobby: Lobby | null;
  availableLobbies: Lobby[];
  
  // Game state
  gameState: GameStateType | null;
  isGameActive: boolean;
  
  // Socket
  socket: Socket | null;
  
  // Views
  currentView: string;
  setCurrentView: (view: string) => void;
  
  // Actions
  createLobby: (name: string) => void;
  joinLobby: (lobbyId: number) => void;
  startGame: () => void;
  shoot: (targetColor: string) => void;
  purchaseItem: (type: "weapon" | "life" | "powerup", item?: Weapon) => void;
  reloadWeapon: () => void;
  spectateLobby: (lobbyId: number) => void; // ADDED
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [currentLobby, setCurrentLobby] = useState<Lobby | null>(null);
  const [availableLobbies, setAvailableLobbies] = useState<Lobby[]>([]);
  const [gameState, setGameState] = useState<GameStateType | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentView, setCurrentView] = useState("login");

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000");
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on("lobby-update", (lobby: Lobby) => {
      setCurrentLobby(lobby);
    });

    newSocket.on("game-started", (gameState: GameStateType) => {
      setGameState(gameState);
      setIsGameActive(true);
      setCurrentView("game");
    });

    newSocket.on("game-update", (gameState: GameStateType) => {
      setGameState(gameState);
    });

    newSocket.on("game-over", (winner: Player) => {
      setIsGameActive(false);
      setCurrentView("winner");
    });

    newSocket.on("available-lobbies", (lobbies: Lobby[]) => {
      setAvailableLobbies(lobbies);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const createLobby = (name: string) => {
    if (!player || !socket) return;
    
    const lobbyId = Date.now();
    socket.emit("join-lobby", { player, lobbyId });
    
    const newLobby: Lobby = {
      id: lobbyId,
      name,
      players: [player],
      maxPlayers: 8
    };
    
    setCurrentLobby(newLobby);
    setCurrentView("lobby");
  };

  const joinLobby = (lobbyId: number) => {
    if (!player || !socket) return;
    socket.emit("join-lobby", { player, lobbyId });
    setCurrentView("lobby");
  };

  const spectateLobby = (lobbyId: number) => { // ADDED FUNCTION
    if (!socket) return;
    socket.emit("spectate-lobby", { lobbyId });
    setCurrentView("spectator");
  };

  const startGame = () => {
    if (!currentLobby || !socket) return;
    socket.emit("start-game", { lobbyId: currentLobby.id });
  };

  const shoot = (targetColor: string) => {
    if (!player || !currentLobby || !socket) return;
    socket.emit("shoot", { 
      playerId: player.id, 
      targetColor, 
      lobbyId: currentLobby.id 
    });
  };

  const purchaseItem = (type: "weapon" | "life" | "powerup", item?: Weapon) => {
    if (!player || !currentLobby || !socket) return;
    socket.emit("purchase", {
      playerId: player.id,
      type,
      item,
      lobbyId: currentLobby.id
    });
  };

  const reloadWeapon = () => {
    if (!player || !gameState) return;
    
    const weaponStats = {
      pistol: { ammoCapacity: 6, reloadTime: 1500 },
      shotgun: { ammoCapacity: 2, reloadTime: 2000 },
      rifle: { ammoCapacity: 30, reloadTime: 2500 }
    };
    
    setGameState({
      ...gameState,
      lobby: {
        ...gameState.lobby,
        players: gameState.lobby.players.map(p => 
          p.id === player.id 
            ? { ...p, ammo: weaponStats[p.currentWeapon].ammoCapacity }
            : p
        )
      }
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
    spectateLobby // ADDED
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};