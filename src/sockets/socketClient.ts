import io, {Socket} from "socket.io-client";

// Simple Socket interface to avoid type issues
interface Socket {
  id: string;
  connected: boolean;
  disconnect(): void;
  on(event: string, callback: (data: any) => void): void;
  emit(event: string, data: any): void;
  off(event: string, callback?: (data: any) => void): void;
}

export const socket: Socket = io(process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5001", {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

// Helper functions for socket events - FIXED all emissions to use object format
export const socketService = {
  joinLobby: (player: any, lobbyId: number) => {
    socket.emit("join-lobby", { player, lobbyId }); // FIXED
  },
  
  startGame: (lobbyId: number) => {
    socket.emit("start-game", { lobbyId }); // FIXED
  },
  
  shoot: (playerId: number, targetColor: string, lobbyId: number) => {
    socket.emit("shoot", { playerId, targetColor, lobbyId }); // FIXED
  },
  
  purchase: (playerId: number, type: string, item: any, lobbyId: number) => {
    socket.emit("purchase", { playerId, type, item, lobbyId }); // FIXED
  }
};

// Debug socket connection
socket.on('connect', () => {
  console.log('✅ Connected to server:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected from server:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

export default socket;