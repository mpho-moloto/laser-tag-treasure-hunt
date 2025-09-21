"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAME_SETTINGS = exports.WEAPON_STATS = void 0;
// Weapon stats
exports.WEAPON_STATS = {
    pistol: { ammoCapacity: 6, reloadTime: 1500, damage: 10 },
    shotgun: { ammoCapacity: 2, reloadTime: 2000, damage: 25 },
    rifle: { ammoCapacity: 30, reloadTime: 2500, damage: 15 },
};
// Game settings
exports.GAME_SETTINGS = {
    MAX_PLAYERS_PER_LOBBY: 8,
    GAME_TIMER_SECONDS: 240,
    POINTS_PER_HIT: 100,
    STARTING_AMMO: 6,
};
