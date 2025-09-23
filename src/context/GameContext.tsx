import React, { createContext, useState, useEffect, ReactNode, useContext, useRef } from "react";
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
  const [hasActiveLobby, setHasActiveLobby] = useState(false);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5003");
    setSocket(newSocket);

    newSocket.on("connect", () => setError(""));
    newSocket.on("connect_error", (err: Error) => setError("Failed to connect to server"));

    newSocket.on("available-lobbies", setAvailableLobbies);

    newSocket.on("lobby-update", (lobby: Lobby) => {
      setCurrentLobby(lobby);
      if (player && lobby.players.some(p => p.id === player.id)) {
        setCurrentView("lobby");
        setHasActiveLobby(true);
      }
    });

    newSocket.on("game-started", (state: GameStateType) => {
      setGameState(state);
      setIsGameActive(true);
      setCurrentView("game");
    });

    newSocket.on("game-update", setGameState);

    newSocket.on("game-over", () => {
      setIsGameActive(false);
      setCurrentView("winner");

      setTimeout(() => {
        setCurrentView("login");
        setCurrentLobby(null);
        setHasActiveLobby(false);
        setGameState(null);
        if (currentLobby && socket) {
          socket.emit("delete-lobby", { lobbyId: currentLobby.id });
        }
      }, 45000);
    });

    newSocket.on("lobby-error", setError);
    newSocket.emit("get-lobbies");

    return () => {
      if (currentLobby && player) newSocket.emit("leave-lobby", { playerId: player.id, lobbyId: currentLobby.id });
      newSocket.disconnect();
    };
  }, []);

  const createLobby = (name: string) => {
    if (!player || !socket) return setError("Not connected to server");
    if (!name.trim()) return setError("Please enter a lobby name");
    if (hasActiveLobby) return setError("You can only host one lobby at a time!");

    socket.emit("create-lobby", { player, name });
  };

  const joinLobby = (lobbyId: number) => {
    if (!player || !socket) return setError("Not connected to server");

    const targetLobby = availableLobbies.find(l => l.id === lobbyId);
    if (targetLobby) {
      const colorExists = targetLobby.players.some(p => p.color === player.color);
      if (colorExists) return setError(`Color ${player.color} already exists!`);
      if (targetLobby.players.length >= targetLobby.maxPlayers) return setError("Lobby full!");
    }

    socket.emit("join-lobby", { player, lobbyId });
  };

  const leaveLobby = () => {
    if (!player || !currentLobby || !socket) return;
    socket.emit("leave-lobby", { playerId: player.id, lobbyId: currentLobby.id });
    setCurrentLobby(null);
    setHasActiveLobby(false);
    setCurrentView("lobby");
  };

  const playerReady = (isReady: boolean) => {
    if (!player || !currentLobby || !socket) return;
    socket.emit("player-ready", { playerId: player.id, lobbyId: currentLobby.id, isReady });
  };

  const spectateLobby = (lobbyId: number) => {
    if (!socket) return setError("Not connected");
    socket.emit("spectate-lobby", { lobbyId });
    setCurrentView("spectator");
  };

  const startGame = () => {
    if (!currentLobby || !socket) return setError("Not in lobby");
    if (currentLobby.players.length < 2) return setError("Need 2+ players");
    socket.emit("start-game", { lobbyId: currentLobby.id });
  };

  const shoot = (targetColor: string) => {
    if (!player || !currentLobby || !socket) return;
    if (currentLobby.state !== "active") return setError("Game not active");
    socket.emit("shoot", { playerId: player.id, targetColor, lobbyId: currentLobby.id });
  };

  const purchaseItem = (type: "weapon" | "life" | "powerup", item?: Weapon) => {
    if (!player || !currentLobby || !socket) return;
    socket.emit("purchase", { playerId: player.id, type, item, lobbyId: currentLobby.id });
  };

  const reloadWeapon = () => {
    if (!player || !currentLobby || !socket) return;
    socket.emit("reload-weapon", { playerId: player.id, lobbyId: currentLobby.id });
  };

  const switchWeapon = (weaponName: string) => {
    if (!player || !currentLobby || !socket) return;
    socket.emit("switch-weapon", { playerId: player.id, weaponName, lobbyId: currentLobby.id });
  };

  return (
    <GameContext.Provider value={{
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
    }}>
      {children}
    </GameContext.Provider>
  );
};
