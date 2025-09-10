export type Weapon = 'pistol' | 'shotgun' | 'rifle';

export interface Player {
  id: number;
  name: string;
  color: string;
  score: number;
  ammo: number;
  lives: number;
  currentWeapon: Weapon;
  weapons: Weapon[];
  x?: number; // Position for minimap
  y?: number;
}

export interface Lobby {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
}

export interface GameState {
  player: Player | null;
  lobby: Lobby | null;
  enemies: Player[];
  lobbies: Lobby[];
  detectedColors: string[];
  timer: number; // seconds
}
