export type Weapon = "pistol" | "shotgun" | "rifle";

export interface Player {
  id: number;
  name: string;
  color: string;
  score: number;
  weapons: Weapon[];
  currentWeapon: Weapon;
  ammo: number;
  lives: number;
  x?: number;
  y?: number;
  hasPowerUp?: boolean;
}

export interface Lobby {
  id: number;
  name: string;
  players: Player[];
  maxPlayers: number;
}

export interface GameState {
  lobby: Lobby;
  active: boolean;
  elapsedTime: number;
  points: number;
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