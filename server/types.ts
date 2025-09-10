// src/utils/types.ts

// Supported weapons
export type Weapon = 'pistol' | 'shotgun' | 'rifle';

// Represents a single player
export interface Player {
  id: number;             // Unique player ID
  name: string;           // Player name
  color: string;          // Shirt color (identity)
  score: number;          // Player score
  lives: number;          // Remaining lives
  ammo: number;           // Current ammo
  currentWeapon: Weapon;  // Currently selected weapon
  weapons: Weapon[];      // Owned weapons
  points: number;         // Points for purchasing
  hasPowerUp?: boolean;   // Optional: power-up state
  x?: number;             // Optional X position on map
  y?: number;             // Optional Y position on map
}

// Represents a lobby
export interface Lobby {
  id: number;              // Unique lobby ID
  name: string;            // Lobby name
  players: Player[];       // Players in the lobby
  maxPlayers: number;      // Max allowed
  timer?: NodeJS.Timeout;  // Optional game timer
}

// Game state for a lobby
export interface GameState {
  lobby: Lobby;
  active: boolean;          // Is the game running?
  elapsedTime: number;      // Time passed in seconds
  points: number;           // Total points for player
  playersInGame?: Player[]; // Current players
}
