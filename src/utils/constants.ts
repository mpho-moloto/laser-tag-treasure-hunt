export interface Weapon {
  name: "pistol" | "shotgun" | "rifle";
  damage: number;
  ammoCapacity: number;
  reloadTime: number;
  fireRate: number;
  cost: number;
}

export interface Player {
  id: number;
  name: string;
  color: string;
  score: number;
  weapons: Weapon[];
  currentWeapon: Weapon;
  ammo: number;
  lives: number;
  hasPowerUp: boolean;
  isSpectator: boolean;
  isReady: boolean;
  lastShotTime: number;
  isReloading: boolean;
  kills: number;
  deaths: number;
}

export interface Lobby {
  id: number;
  name: string;
  players: Player[];
  maxPlayers: number;
  state: "waiting" | "pregame" | "active" | "finished";
}

export interface GameState {
  lobby: Lobby;
  active: boolean;
  elapsedTime: number;
  points: number;
}

export const WEAPONS: Weapon[] = [
  { name: "pistol", damage: 1, ammoCapacity: 6, reloadTime: 1500, fireRate: 1, cost: 0 },
  { name: "shotgun", damage: 3, ammoCapacity: 2, reloadTime: 2000, fireRate: 0.5, cost: 300 },
  { name: "rifle", damage: 2, ammoCapacity: 30, reloadTime: 2500, fireRate: 4, cost: 500 },
];

export const GAME_SETTINGS = {
  MAX_PLAYERS_PER_LOBBY: 8,
  POINTS_PER_HIT: 100,
  POINTS_PER_KILL: 500,
  INITIAL_LIVES: 3,
  GAME_DURATION: 300,
  RESPAWN_TIME: 5000,
};