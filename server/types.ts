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

// Weapon stats
export const WEAPON_STATS: Record<Weapon, { ammoCapacity: number; reloadTime: number; damage: number }> = {
  pistol: { ammoCapacity: 6, reloadTime: 1500, damage: 10 },
  shotgun: { ammoCapacity: 2, reloadTime: 2000, damage: 25 },
  rifle: { ammoCapacity: 30, reloadTime: 2500, damage: 15 },
};

// Game settings
export const GAME_SETTINGS = {
  MAX_PLAYERS_PER_LOBBY: 8,
  GAME_TIMER_SECONDS: 240,
  POINTS_PER_HIT: 100,
  STARTING_AMMO: 6,
};
