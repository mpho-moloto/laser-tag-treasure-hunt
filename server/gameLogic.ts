import { Player, Lobby, Weapon, WEAPONS, GAME_SETTINGS } from "../src/utils/constants";

export const lobbies: Record<number, { lobby: Lobby; active: boolean; gameStartTime: number }> = {};

// Initialize player with proper defaults
function initializePlayer(player: Player): Player {
  const defaultWeapon = WEAPONS[0];
  return {
    ...player,
    score: 0,
    weapons: player.weapons?.length ? player.weapons : [defaultWeapon],
    currentWeapon: player.currentWeapon || defaultWeapon,
    ammo: player.ammo || defaultWeapon.ammoCapacity,
    lives: player.lives || GAME_SETTINGS.INITIAL_LIVES,
    hasPowerUp: player.hasPowerUp || false,
    isSpectator: player.isSpectator || false,
    isReady: false,
    lastShotTime: 0,
    isReloading: false,
    kills: 0,
    deaths: 0
  };
}

export function createLobby(player: Player, lobbyId: number, name: string) {
  if (lobbies[lobbyId]) {
    console.log("❌ Lobby already exists:", lobbyId);
    return null;
  }

  const initializedPlayer = initializePlayer(player);
  
  const newLobby: Lobby = {
    id: lobbyId,
    name: name || `Battle ${lobbyId}`,
    players: [initializedPlayer],
    maxPlayers: GAME_SETTINGS.MAX_PLAYERS_PER_LOBBY,
    state: "waiting"
  };

  lobbies[lobbyId] = { lobby: newLobby, active: false, gameStartTime: 0 };
  console.log("✅ Created lobby:", lobbyId, "with name:", name);
  return lobbies[lobbyId];
}

export function joinLobby(player: Player, lobbyId: number) {
  const lobbyState = lobbies[lobbyId];
  if (!lobbyState) {
    console.log("❌ Lobby not found:", lobbyId);
    return null;
  }

  // NEW: Check if color already exists in this lobby
  const colorExists = lobbyState.lobby.players.some(p => p.color === player.color);
  if (colorExists) {
    console.log(`❌ Color ${player.color} already exists in lobby ${lobbyId}`);
    return null; // Prevent joining
  }

  if (lobbyState.lobby.players.find(p => p.id === player.id)) {
    console.log("ℹ️ Player already in lobby:", player.id);
    return lobbyState;
  }

  if (lobbyState.lobby.players.length >= lobbyState.lobby.maxPlayers) {
    console.log("❌ Lobby is full:", lobbyId);
    return null;
  }

  const initializedPlayer = initializePlayer(player);
  lobbyState.lobby.players.push(initializedPlayer);
  console.log("✅ Player joined lobby:", player.name, "Color:", player.color, "Lobby:", lobbyId);
  return lobbyState;
}

export function leaveLobby(playerId: number, lobbyId: number) {
  const lobbyState = lobbies[lobbyId];
  if (!lobbyState) {
    console.log("❌ Lobby not found for leave:", lobbyId);
    return null;
  }

  lobbyState.lobby.players = lobbyState.lobby.players.filter(p => p.id !== playerId);
  console.log("✅ Player left lobby:", playerId, "from lobby:", lobbyId);

  if (lobbyState.lobby.players.length === 0) {
    delete lobbies[lobbyId];
    console.log("🗑️ Deleted empty lobby:", lobbyId);
    return null;
  }

  return lobbyState;
}

export function setPlayerReady(playerId: number, lobbyId: number, isReady: boolean) {
  const lobbyState = lobbies[lobbyId];
  if (!lobbyState) return null;

  const player = lobbyState.lobby.players.find(p => p.id === playerId);
  if (player) {
    player.isReady = isReady;
    console.log("✅ Player ready state:", player.name, "ready:", isReady);
    
    const allReady = lobbyState.lobby.players.every(p => p.isReady);
    if (allReady && lobbyState.lobby.players.length >= 2 && lobbyState.lobby.state === "waiting") {
      lobbyState.lobby.state = "pregame";
      console.log("✅ All players ready, moving to pregame phase");
    }
  }

  return lobbyState;
}

export function startGame(lobbyId: number) {
  const lobbyState = lobbies[lobbyId];
  if (!lobbyState) {
    console.log("❌ Lobby not found for start game:", lobbyId);
    return null;
  }

  if (lobbyState.lobby.players.length < 2) {
    console.log("❌ Need at least 2 players to start");
    return null;
  }

  lobbyState.lobby.players.forEach(player => {
    player.score = 0;
    player.lives = GAME_SETTINGS.INITIAL_LIVES;
    player.ammo = player.currentWeapon.ammoCapacity;
    player.hasPowerUp = false;
    player.kills = 0;
    player.deaths = 0;
    player.isReloading = false;
    player.isReady = false;
  });

  lobbyState.active = true;
  lobbyState.lobby.state = "active";
  lobbyState.gameStartTime = Date.now();
  console.log("✅ Game started in lobby:", lobbyId);
  
  return lobbyState;
}

// ENHANCED: Color validation for shooting
export function handleShoot(playerId: number, targetColor: string, lobbyId: number) {
  const lobbyState = lobbies[lobbyId];
  if (!lobbyState || !lobbyState.active) return null;

  const shooter = lobbyState.lobby.players.find(p => p.id === playerId);
  if (!shooter || shooter.lives <= 0) return lobbyState;

  // NEW: Check if target color actually exists in this lobby
  const validTargetColors = lobbyState.lobby.players
    .filter(p => p.id !== playerId && p.lives > 0)
    .map(p => p.color);
  
  // Only allow shooting if the color exists in the lobby
  if (!validTargetColors.includes(targetColor)) {
    console.log(`❌ Invalid target color: ${targetColor}. Valid colors: ${validTargetColors}`);
    return lobbyState; // No points awarded for invalid colors
  }

  const target = lobbyState.lobby.players.find(p => p.color === targetColor && p.id !== playerId && p.lives > 0);
  
  if (!target) return lobbyState;

  // Check ammo
  if (shooter.ammo <= 0) {
    startReload(shooter);
    return lobbyState;
  }

  // Check cooldown
  const now = Date.now();
  const timeBetweenShots = 1000 / shooter.currentWeapon.fireRate;
  if (now - shooter.lastShotTime < timeBetweenShots) {
    return lobbyState;
  }

  // Consume ammo and shoot
  shooter.ammo--;
  shooter.lastShotTime = now;

  // Apply damage
  const damage = shooter.hasPowerUp ? shooter.currentWeapon.damage * 2 : shooter.currentWeapon.damage;
  target.lives -= damage;
  
  // Award points for hit
  shooter.score += GAME_SETTINGS.POINTS_PER_HIT;

  // Check if target died
  if (target.lives <= 0) {
    target.lives = 0;
    target.deaths++;
    shooter.kills++;
    shooter.score += GAME_SETTINGS.POINTS_PER_KILL;
    
    checkGameEnd(lobbyState);
  }

  return lobbyState;
}

function startReload(player: Player) {
  if (player.isReloading || player.ammo === player.currentWeapon.ammoCapacity) return;

  player.isReloading = true;
  
  setTimeout(() => {
    player.ammo = player.currentWeapon.ammoCapacity;
    player.isReloading = false;
  }, player.currentWeapon.reloadTime);
}

export function handleReload(playerId: number, lobbyId: number) {
  const lobbyState = lobbies[lobbyId];
  if (!lobbyState) return null;

  const player = lobbyState.lobby.players.find(p => p.id === playerId);
  if (!player || player.isReloading) return null;

  startReload(player);
  return lobbyState;
}

export function handlePurchase(playerId: number, type: "weapon" | "life" | "powerup", item?: Weapon, lobbyId?: number) {
  if (!lobbyId) return null;
  const lobbyState = lobbies[lobbyId];
  if (!lobbyState) return null;

  const player = lobbyState.lobby.players.find(p => p.id === playerId);
  if (!player) return null;

  switch (type) {
    case "life":
      if (player.score >= 200) {
        player.lives++;
        player.score -= 200;
      }
      break;
      
    case "weapon":
      if (item && player.score >= item.cost) {
        const alreadyOwned = player.weapons.some(w => w.name === item.name);
        
        if (!alreadyOwned) {
          player.weapons.push(item);
          player.score -= item.cost;
        }
        
        player.currentWeapon = item;
        player.ammo = item.ammoCapacity;
      }
      break;
      
    case "powerup":
      if (player.score >= 1000 && !player.hasPowerUp) {
        player.hasPowerUp = true;
        player.score -= 1000;
        
        setTimeout(() => {
          player.hasPowerUp = false;
        }, 30000);
      }
      break;
  }

  return lobbyState;
}

export function handleWeaponSwitch(playerId: number, weaponName: string, lobbyId: number) {
  const lobbyState = lobbies[lobbyId];
  if (!lobbyState) return null;

  const player = lobbyState.lobby.players.find(p => p.id === playerId);
  if (!player) return null;

  const weapon = player.weapons.find(w => w.name === weaponName);
  if (weapon) {
    player.currentWeapon = weapon;
    player.ammo = weapon.ammoCapacity;
  }

  return lobbyState;
}

function checkGameEnd(lobbyState: any) {
  const alivePlayers = lobbyState.lobby.players.filter((p: Player) => p.lives > 0);
  
  if (alivePlayers.length <= 1) {
    lobbyState.active = false;
    lobbyState.lobby.state = "finished";
    
    if (alivePlayers.length === 1) {
      const winner = alivePlayers[0];
      winner.score += 1000;
    }
    
    return true;
  }
  
  return false;
}

export function getGameTimeRemaining(lobbyId: number): number {
  const lobbyState = lobbies[lobbyId];
  if (!lobbyState || !lobbyState.active) return 0;
  
  const elapsed = Date.now() - lobbyState.gameStartTime;
  const remaining = GAME_SETTINGS.GAME_DURATION * 1000 - elapsed;
  
  return Math.max(0, Math.floor(remaining / 1000));
}

export function getAvailableLobbies() {
  return Object.values(lobbies)
    .filter(l => l.lobby.state === "waiting" && l.lobby.players.length < l.lobby.maxPlayers)
    .map(l => l.lobby);
}