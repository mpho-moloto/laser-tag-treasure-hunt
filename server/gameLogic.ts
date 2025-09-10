import { Player, Lobby, Weapon, GameState, GAME_SETTINGS, WEAPON_STATS } from "../src/utils/constants";

// Map of lobbies by ID
export const lobbies: Record<number, GameState> = {};

// Handle joining a lobby
export function joinLobby(player: Player, lobbyId: number, lobbyName?: string): GameState {
  let lobbyState = lobbies[lobbyId];

  if (!lobbyState) {
    // Create a new lobby if it doesn't exist
    const newLobby: GameState = {
      lobby: {
        id: lobbyId,
        name: lobbyName || `Lobby-${lobbyId}`,
        players: [player],
        maxPlayers: GAME_SETTINGS.MAX_PLAYERS_PER_LOBBY,
      },
      active: false,
      elapsedTime: 0,
      points: 0,
    };
    lobbies[lobbyId] = newLobby;
    return newLobby;
  }

  // Add player if lobby exists and not full
  if (lobbyState.lobby.players.length < lobbyState.lobby.maxPlayers) {
    // Check if player already exists (reconnection)
    const existingPlayerIndex = lobbyState.lobby.players.findIndex(p => p.id === player.id);
    if (existingPlayerIndex !== -1) {
      lobbyState.lobby.players[existingPlayerIndex] = player;
    } else {
      lobbyState.lobby.players.push(player);
    }
  }

  return lobbyState;
}

// Start game
export function startGame(lobbyId: number): GameState | null {
  const lobbyState = lobbies[lobbyId];
  if (!lobbyState || lobbyState.lobby.players.length < 2) return null;

  lobbyState.active = true;
  lobbyState.elapsedTime = 0;
  
  // Reset player states for new game
  lobbyState.lobby.players.forEach(player => {
    player.lives = 3;
    player.ammo = WEAPON_STATS[player.currentWeapon].ammoCapacity;
    player.score = 0;
  });

  return lobbyState;
}

// Handle shooting
export function handleShoot(playerId: number, targetColor: string, lobbyId: number): GameState | null {
  const lobbyState = lobbies[lobbyId];
  if (!lobbyState || !lobbyState.active) return null;

  const shooter = lobbyState.lobby.players.find(p => p.id === playerId);
  if (!shooter || shooter.color === targetColor) return null; // cannot shoot self

  const target = lobbyState.lobby.players.find(p => p.color === targetColor);
  if (!target || target.lives <= 0) return null; // target not found or already dead

  // Check ammo
  if (shooter.ammo <= 0) return null;
  shooter.ammo -= 1;

  // Apply damage
  const weaponStats = WEAPON_STATS[shooter.currentWeapon];
  target.lives -= 1;

  // Award points
  shooter.score += GAME_SETTINGS.POINTS_PER_HIT;
  if (target.lives <= 0) {
    shooter.score += GAME_SETTINGS.POINTS_PER_HIT * 2; // bonus for elimination
  }

  lobbyState.points += GAME_SETTINGS.POINTS_PER_HIT;

  return lobbyState;
}

// Handle purchasing
export function handlePurchase(playerId: number, type: "weapon" | "life" | "powerup", item?: Weapon, lobbyId?: number): GameState | null {
  if (!lobbyId) return null;
  const lobbyState = lobbies[lobbyId];
  if (!lobbyState) return null;

  const player = lobbyState.lobby.players.find(p => p.id === playerId);
  if (!player) return null;

  let cost = 0;
  switch (type) {
    case "weapon":
      cost = 300;
      break;
    case "life":
      cost = 200;
      break;
    case "powerup":
      cost = 500;
      break;
  }

  if (player.score < cost) return null; // not enough points

  player.score -= cost;

  if (type === "weapon" && item) {
    if (!player.weapons.includes(item)) {
      player.weapons.push(item);
      player.currentWeapon = item;
      player.ammo = WEAPON_STATS[item].ammoCapacity;
    }
  } else if (type === "life") {
    player.lives += 1;
  } else if (type === "powerup") {
    player.hasPowerUp = true;
    // Powerup lasts for 30 seconds
    setTimeout(() => {
      player.hasPowerUp = false;
    }, 30000);
  }

  return lobbyState;
}