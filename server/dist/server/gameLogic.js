"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lobbies = void 0;
exports.joinLobby = joinLobby;
exports.startGame = startGame;
exports.handleShoot = handleShoot;
exports.handlePurchase = handlePurchase;
const types_1 = require("./types");
// Map of lobbies by ID
exports.lobbies = {};
// Handle joining a lobby
function joinLobby(player, lobbyId, lobbyName) {
    let lobbyState = exports.lobbies[lobbyId];
    if (!lobbyState) {
        // Create a new lobby if it doesn't exist
        const newLobby = {
            lobby: {
                id: lobbyId,
                name: lobbyName || `Lobby-${lobbyId}`,
                players: [player],
                maxPlayers: types_1.GAME_SETTINGS.MAX_PLAYERS_PER_LOBBY,
            },
            active: false,
            elapsedTime: 0,
            points: 0,
        };
        exports.lobbies[lobbyId] = newLobby;
        return newLobby;
    }
    // Add player if lobby exists and not full
    if (lobbyState.lobby.players.length < lobbyState.lobby.maxPlayers) {
        // Check if player already exists (reconnection)
        const existingPlayerIndex = lobbyState.lobby.players.findIndex(p => p.id === player.id);
        if (existingPlayerIndex !== -1) {
            lobbyState.lobby.players[existingPlayerIndex] = player;
        }
        else {
            lobbyState.lobby.players.push(player);
        }
    }
    return lobbyState;
}
// Start game
function startGame(lobbyId) {
    const lobbyState = exports.lobbies[lobbyId];
    if (!lobbyState || lobbyState.lobby.players.length < 2)
        return null;
    lobbyState.active = true;
    lobbyState.elapsedTime = 0;
    // Reset player states for new game
    lobbyState.lobby.players.forEach(player => {
        player.lives = 3;
        player.ammo = types_1.WEAPON_STATS[player.currentWeapon].ammoCapacity;
        player.score = 0;
    });
    return lobbyState;
}
// Handle shooting
function handleShoot(playerId, targetColor, lobbyId) {
    const lobbyState = exports.lobbies[lobbyId];
    if (!lobbyState || !lobbyState.active)
        return null;
    const shooter = lobbyState.lobby.players.find(p => p.id === playerId);
    if (!shooter || shooter.color === targetColor)
        return null; // cannot shoot self
    const target = lobbyState.lobby.players.find(p => p.color === targetColor);
    if (!target || target.lives <= 0)
        return null; // target not found or already dead
    // Check ammo
    if (shooter.ammo <= 0)
        return null;
    shooter.ammo -= 1;
    // Apply damage
    const weaponStats = types_1.WEAPON_STATS[shooter.currentWeapon];
    target.lives -= 1;
    // Award points
    shooter.score += types_1.GAME_SETTINGS.POINTS_PER_HIT;
    if (target.lives <= 0) {
        shooter.score += types_1.GAME_SETTINGS.POINTS_PER_HIT * 2; // bonus for elimination
    }
    lobbyState.points += types_1.GAME_SETTINGS.POINTS_PER_HIT;
    return lobbyState;
}
// Handle purchasing
function handlePurchase(playerId, type, item, lobbyId) {
    if (!lobbyId)
        return null;
    const lobbyState = exports.lobbies[lobbyId];
    if (!lobbyState)
        return null;
    const player = lobbyState.lobby.players.find(p => p.id === playerId);
    if (!player)
        return null;
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
    if (player.score < cost)
        return null; // not enough points
    player.score -= cost;
    if (type === "weapon" && item) {
        if (!player.weapons.includes(item)) {
            player.weapons.push(item);
            player.currentWeapon = item;
            player.ammo = types_1.WEAPON_STATS[item].ammoCapacity;
        }
    }
    else if (type === "life") {
        player.lives += 1;
    }
    else if (type === "powerup") {
        player.hasPowerUp = true;
        // Powerup lasts for 30 seconds
        setTimeout(() => {
            player.hasPowerUp = false;
        }, 30000);
    }
    return lobbyState;
}
