// Student Number: 2023094242
// Student Number: 2019042973

import { WebSocketServer } from 'ws';

// BattleServer manages all WebSocket connections, sessions, and real-time game logic for laser tag battles.
class BattleServer {
  constructor(server) {
    // Create a WebSocket server attached to the provided HTTP server
    this.wss = new WebSocketServer({ server });
    // Store all active game sessions, keyed by game code
    this.sessions = new Map();
    // Set up connection handler for new clients
    this.setupConnectionHandler();
    // Start the main game loop for all sessions
    this.startGameLoop();
  }

  // Handles new WebSocket connections from players and spectators
  setupConnectionHandler() {
    this.wss.on('connection', (ws, req) => {
      // Parse URL to extract game code, room type, player name, and color
      const url = new URL(req.url, 'http://localhost');
      const pathParts = url.pathname.split('/');
      const gameCode = pathParts[1];
      const roomType = pathParts[2]; // 'lobby', 'game', or 'spectate'
      const playerName = url.searchParams.get('player');
      const playerColor = url.searchParams.get('color');

      // If no game code, close connection
      if (!gameCode) {
        ws.close(1000, 'Game code required');
        return;
      }

     
      // Create or retrieve the session for this game code
      let session = this.sessions.get(gameCode);
      if (!session) {
        session = {
          players: new Map(),
          spectators: new Map(),
          commander: null,
          gameState: 'lobby',
          battleStarted: false,
          gameTime: 300,
          gameStartTime: null,
          lastUpdate: Date.now(),
          scannedColors: new Set(),
          sessionCreated: Date.now(),
   
          gpsBounds: {
            minLat: 90,
            maxLat: -90,
            minLng: 180,
            maxLng: -180
          }
        };
        this.sessions.set(gameCode, session);
        console.log(`🎮 New session created: ${gameCode}`);
      } else {
        console.log(`🎮 Existing session joined: ${gameCode}`);
      }

      
      // Handle spectator connections
      if (roomType === 'spectate') {
        const spectatorId = `spectator-${Date.now()}`;
        session.spectators.set(spectatorId, {
          id: spectatorId,
          ws: ws,
          joinedAt: Date.now()
        });

        // Send current game state to the new spectator
        this.sendToPlayer(ws, {
          type: 'spectatorUpdate',
          gameState: {
            timeRemaining: session.gameTime,
            combatants: this.getPlayerData(session),
            battleStarted: session.battleStarted
          }
        });

        ws.on('close', () => {
          session.spectators.delete(spectatorId);
          console.log(`👋 Spectator disconnected from ${gameCode}`);
        });

        ws.on('error', (error) => {
          console.error(`Spectator WebSocket error:`, error);
        });

        return;
      }

      // Handle player connections
      if (!playerName) {
        ws.close(1000, 'Player name required');
        return;
      }

      // Generate a unique player ID and remove any previous connections for this player name
      const playerId = `${playerName}-${Date.now()}`;
      this.removePlayerFromSession(session, playerName);

      // Track scanned colors for validation
      if (playerColor) {
        session.scannedColors.add(playerColor);
      }
      // Assign commander if none exists and player joins lobby
      if (!session.commander && roomType === 'lobby') {
        session.commander = playerName;
        console.log(`👑 ${playerName} assigned as commander for ${gameCode}`);
      }


      // Add player to the session with initial stats
      session.players.set(playerId, {
        id: playerId,
        name: playerName,
        color: playerColor,
        ws: ws,
        room: roomType || 'lobby',
        stats: {
          points: 0,
          lives: 3,
          health: 100,
          ammo: 5,
          weapons: ['pistol'],
          position: this.generateRandomPosition(), 
          gpsPosition: null, 
          gpsAvailable: false, 
          lastShot: 0,
          hits: 0,
          misses: 0,
          eliminations: 0,
          deaths: 0,
          isEliminated: false,
          activePowerups: {}
        }
      });

      console.log(`🎯 ${playerName} joined ${gameCode} as ${roomType}. Commander: ${session.commander}`);

     
      // If the battle has started, redirect lobby joiners to the battle
      if (session.battleStarted && roomType === 'lobby') {
     
        const player = session.players.get(playerId);
        player.room = 'game';
        player.stats.isEliminated = true;
        
        this.sendToPlayer(ws, {
          type: 'joinAsSpectator',
          gameState: {
            timeRemaining: session.gameTime,
            combatants: this.getPlayerData(session)
          }
        });
      }

      // Notify all clients in the session of the updated player list
      this.broadcastSessionUpdate(session);

      // Handle incoming messages from this player
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(session, playerId, message);
        } catch (error) {
          console.error('Message error:', error);
        }
      });

      ws.on('close', () => {
        console.log(`👋 ${playerName} disconnected from ${gameCode}`);
        const player = session.players.get(playerId);
        if (player) {
          this.broadcastToSession(session, {
            type: 'playerLeft',
            player: playerName
          });
        }
        session.players.delete(playerId);
        
      
        if (session.commander === playerName && session.players.size > 0) {
          const remainingPlayers = Array.from(session.players.values())
            .filter(p => p.room === 'lobby')
            .sort((a, b) => a.id.localeCompare(b.id)); 
          
          if (remainingPlayers.length > 0) {
            session.commander = remainingPlayers[0].name;
            console.log(`👑 ${session.commander} is new commander for ${gameCode}`);
          }
        }
        
        this.broadcastSessionUpdate(session);
        

        if (session.battleStarted && session.gameState === 'battle') {
          this.checkWinConditions(session);
        }
        
       
        this.broadcastToSpectators(session, {
          type: 'spectatorUpdate',
          gameState: {
            timeRemaining: session.gameTime,
            combatants: this.getPlayerData(session),
            battleStarted: session.battleStarted
          }
        });
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for ${playerName}:`, error);
      });
    });
  }

  // Handles messages sent by players (e.g., start battle, fire, purchase, reload, leave)
  handleMessage(session, playerId, message) {
    const player = session.players.get(playerId);
    if (!player) return;
    
    switch (message.action) {
      case 'startBattle':
        this.handleStartBattle(session, player);
        break;
      case 'fire':
        this.handleFire(session, player, message);
        break;
      case 'purchase':
        this.handlePurchase(session, player, message);
        break;
      case 'reload':
        this.handleReload(session, player, message);
        break;
      case 'leave':
        this.handleLeave(session, player);
        break;
      case 'gpsUpdate': 
        this.handleGpsUpdate(session, player, message);
        break;
    }
  }

  // Handles GPS updates from players
  handleGpsUpdate(session, player, message) {
    if (message.latitude && message.longitude) {
      player.stats.gpsPosition = {
        latitude: message.latitude,
        longitude: message.longitude,
        accuracy: message.accuracy || 0,
        timestamp: Date.now()
      };
      player.stats.gpsAvailable = true;
      
    
      this.updateGpsBounds(session, message.latitude, message.longitude);
      
      player.stats.position = this.gpsToMinimap(session, message.latitude, message.longitude);
      
      console.log(`📍 ${player.name} GPS: ${message.latitude.toFixed(4)}, ${message.longitude.toFixed(4)}`);
    } else {
      player.stats.gpsAvailable = false;
      player.stats.gpsPosition = null;
      player.stats.position = null;
    }
    
    this.broadcastArenaUpdate(session);
  }

  // Updates the GPS bounds for the session based on new player coordinates
  updateGpsBounds(session, lat, lng) {
    session.gpsBounds.minLat = Math.min(session.gpsBounds.minLat, lat);
    session.gpsBounds.maxLat = Math.max(session.gpsBounds.maxLat, lat);
    session.gpsBounds.minLng = Math.min(session.gpsBounds.minLng, lng);
    session.gpsBounds.maxLng = Math.max(session.gpsBounds.maxLng, lng);
  }

  // Converts GPS coordinates to minimap coordinates (0-100 scale)
  gpsToMinimap(session, lat, lng) {
    const bounds = session.gpsBounds;
    

    const latRange = Math.max(bounds.maxLat - bounds.minLat, 0.0001);
    const lngRange = Math.max(bounds.maxLng - bounds.minLng, 0.0001);
    
    const x = ((lng - bounds.minLng) / lngRange) * 100;
    const y = ((lat - bounds.minLat) / latRange) * 100;
    
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, 100 - y)) 
    };
  }

  // Handles the start of a battle, initiated by the commander
  handleStartBattle(session, player) {
  
    if (player.name === session.commander && !session.battleStarted) {
      session.battleStarted = true;
      session.gameState = 'battle';
      session.gameTime = 300;
      session.gameStartTime = Date.now();
      
      console.log(`⚔️ Battle starting for ${Array.from(session.players.keys())[0]?.split('-')[0]} session by ${player.name}`);
      

      session.players.forEach(player => {
        player.room = 'game';
        player.stats = {
          points: 0,
          lives: 3,
          health: 100,
          ammo: 5,
          weapons: ['pistol'],
          position: this.generateRandomPosition(),
          gpsPosition: null,
          gpsAvailable: false,
          lastShot: 0,
          hits: 0,
          misses: 0,
          eliminations: 0,
          deaths: 0,
          isEliminated: false,
          activePowerups: {}
        };
      });


      this.broadcastToSession(session, {
        type: 'battleStart',
        players: this.getPlayerData(session),
        commander: session.commander
      });

      
      this.broadcastToSpectators(session, {
        type: 'battleStart',
        players: this.getPlayerData(session)
      });
      
      console.log(`⚔️ Battle started successfully by ${player.name}. Players: ${session.players.size}`);
    } else {
      console.log(`🚫 ${player.name} tried to start battle but is not commander or battle already started`);
    }
  }

  // Handles a player's firing action, including hit/miss logic and updating stats
  handleFire(session, shooter, message) {
    const now = Date.now();
    const shotCooldown = 500;


    // Validate shooter state
    if (shooter.stats.isEliminated) {
      console.log(`🚫 ${shooter.name} tried to shoot but is eliminated`);
      return;
    }
    
    // Validate game state
    if (session.gameState !== 'battle') {
      console.log(`🚫 ${shooter.name} tried to shoot but game not active`);
      return;
    }
    
    if (now - shooter.stats.lastShot < shotCooldown) return;
    if (shooter.stats.ammo <= 0) return;

    //
    shooter.stats.ammo--;
    shooter.stats.lastShot = now;

    // Validate target color
    if (!session.scannedColors.has(message.targetColor)) {
      shooter.stats.misses++;
      this.sendToPlayer(shooter.ws, {
        type: 'hitResult',
        hit: false,
        message: 'Invalid target color!'
      });
      return;
    }

    // Find the target player by color (excluding the shooter)
    const target = Array.from(session.players.values()).find(player => 
      player.color === message.targetColor && 
      player.name !== shooter.name &&
      !player.stats.isEliminated &&
      player.room === 'game'
    );

    if (target) {
      // Calculate damage with weapon and power-ups
      const weaponDamage = {
        pistol: 25,
        rifle: 35,
        shotgun: 50
      };

      let baseDamage = weaponDamage[message.weapon] || 25;

      // Apply double damage power-up if active
      if (shooter.stats.activePowerups.doubleDamage) {
        baseDamage *= 2;
      }

      const pointsEarned = 25;
      // Update stats for hit
      shooter.stats.points += pointsEarned;
      shooter.stats.hits++;
      
      target.stats.health = Math.max(0, target.stats.health - baseDamage);

      // Notify both players if the hit
      this.sendToPlayer(shooter.ws, {
        type: 'hitConfirmed',
        damage: baseDamage,
        points: shooter.stats.points,
        target: target.name,
        hit: true
      });

      this.sendToPlayer(target.ws, {
        type: 'playerHit',
        damage: baseDamage,
        shooter: shooter.name,
        healthRemaining: target.stats.health,
        livesRemaining: target.stats.lives
      });

      console.log(`🎯 ${shooter.name} hit ${target.name} for ${baseDamage} damage`);

      if (target.stats.health <= 0) {
        this.handleLifeLost(session, target, shooter);
      }

      this.checkWinConditions(session);

    } else {
      // No valid target found, count as miss
      shooter.stats.misses++;
      this.sendToPlayer(shooter.ws, {
        type: 'hitResult',
        hit: false,
        message: 'Miss! No valid target found.'
      });
    }

    this.broadcastArenaUpdate(session);
  }

  // Handles when a player loses a life, including elimination logic
  handleLifeLost(session, target, shooter) {
    target.stats.lives--;
    target.stats.deaths++;
    
    if (target.stats.lives > 0) {
      target.stats.health = 100;
      shooter.stats.points += 50;
      
      this.broadcastToSession(session, {
        type: 'playerLifeLost',
        player: target.name,
        by: shooter.name,
        livesRemaining: target.stats.lives
      });
      
    } else {
      this.handlePlayerElimination(session, target, shooter);
    }
  }

  // Handles player elimination from the game
  handlePlayerElimination(session, target, killer) {
    target.stats.isEliminated = true;
    killer.stats.points += 100;
    killer.stats.eliminations++;
    
    this.broadcastToSession(session, {
      type: 'playerEliminated',
      player: target.name,
      by: killer.name
    });

    console.log(`💀 ${target.name} eliminated by ${killer.name}`);
    this.checkWinConditions(session);
  }

  // Handles a player leaving the session
  handlePurchase(session, player, message) {
    const shopItems = {
      rifle: { cost: 100, ammo: 10, type: 'weapon' },
      shotgun: { cost: 200, ammo: 6, type: 'weapon' },
      healthPack: { cost: 80, type: 'health', amount: 100 },
      doubleDamage: { cost: 150, type: 'powerup', duration: 30 }
    };

    const item = shopItems[message.item];
    if (!item) return;

    if (player.stats.points >= item.cost) {
      player.stats.points -= item.cost;

      if (item.type === 'weapon') {
        if (!player.stats.weapons.includes(message.item)) {
          player.stats.weapons.push(message.item);
        }
        player.stats.ammo = item.ammo;
      } else if (item.type === 'health') {
        player.stats.health = Math.min(100, player.stats.health + item.amount);
      } else if (item.type === 'powerup') {
        player.stats.activePowerups[message.item] = Date.now() + (item.duration * 1000);
      }

      this.sendToPlayer(player.ws, {
        type: 'purchaseSuccess',
        item: message.item,
        points: player.stats.points
      });

      this.broadcastArenaUpdate(session);
    } else {
      this.sendToPlayer(player.ws, {
        type: 'purchaseFailed',
        reason: 'Insufficient points'
      });
    }
  }

  // Handles a player leaving the session
  handleReload(session, player, message) {
    const weaponAmmo = {
      pistol: 5,
      rifle: 10,
      shotgun: 6
    };

    // Validate weapon
    const ammoCount = weaponAmmo[message.weapon] || 5;
    player.stats.ammo = ammoCount;

    this.sendToPlayer(player.ws, {
      type: 'reloadComplete',
      weapon: message.weapon,
      ammo: ammoCount
    });

    this.broadcastArenaUpdate(session);
  }

  // Checks if win conditions are met (last player standing or time up)
  checkWinConditions(session) {
    if (!session.battleStarted || session.gameState !== 'battle') return;

    const activePlayers = Array.from(session.players.values()).filter(p => 
      !p.stats.isEliminated && p.room === 'game'
    );
    
    console.log(`Active players: ${activePlayers.length}, Total players: ${session.players.size}`);
    
    if (activePlayers.length === 1 && session.players.size > 1) {
      console.log(`🏆 Only one player left: ${activePlayers[0].name}`);
      this.endGame(session, activePlayers[0], 'last_man_standing');
      return;
    }
    
    if (activePlayers.length === 0 && session.players.size > 0) {
      this.endGame(session, null, 'draw');
      return;
    }
  }

  // Main game loop that updates game state every second
  startGameLoop() {
    setInterval(() => {
      const now = Date.now();
      
      this.sessions.forEach((session, gameCode) => {
        if (session.battleStarted && session.gameStartTime && session.gameState === 'battle') {
          const elapsedSeconds = Math.floor((now - session.gameStartTime) / 1000);
          session.gameTime = Math.max(0, 300 - elapsedSeconds);
          
          session.players.forEach(player => {
            Object.keys(player.stats.activePowerups).forEach(powerup => {
              if (player.stats.activePowerups[powerup] <= now) {
                delete player.stats.activePowerups[powerup];
              }
            });
          });
          
          this.broadcastArenaUpdate(session);

          if (session.gameTime <= 0) {
            console.log(`⏰ Time up for session ${gameCode}`);
            this.endGame(session, null, 'time_up');
          }
        }
      });
    }, 1000);
  }

  // Ends the game, determines winner, and notifies all clients
  endGame(session, winner = null, winCondition = 'time_up') {
    if (session.gameState === 'finished') return;
    
    session.battleStarted = false;
    session.gameState = 'finished';
    
    if (!winner) {
      const activePlayers = Array.from(session.players.values()).filter(p => !p.stats.isEliminated);
      if (activePlayers.length > 0) {
        winner = activePlayers.reduce((prev, current) => 
          (prev.stats.points > current.stats.points) ? prev : current
        );
      } else if (session.players.size > 0) {
        winner = Array.from(session.players.values()).reduce((prev, current) => 
          (prev.stats.points > current.stats.points) ? prev : current
        );
      }
    }

    const results = this.getPlayerData(session).sort((a, b) => b.points - a.points);
    
    // Mark all players as eliminated
    session.players.forEach(player => {
      player.stats.isEliminated = true;
    });
    
    this.broadcastToSession(session, {
      type: 'gameEnd',
      results: results,
      winner: winner?.name || 'No winner',
      winCondition: winCondition,
      moveToSpectator: true
    });

    this.broadcastToSpectators(session, {
      type: 'gameEnd',
      results: results,
      winner: winner?.name || 'No winner',
      winCondition: winCondition
    });

    console.log(`🏆 Game ended! Winner: ${winner?.name || 'None'} (${winCondition})`);
    
    setTimeout(() => {
      console.log(`🧹 Cleaning up session: ${gameCode}`);
      this.sessions.delete(gameCode);
    }, 30000);
  }

  // Broadcasts the current arena state to all players and spectators
  broadcastArenaUpdate(session) {
    const gameState = {
      type: 'arenaUpdate',
      gameState: {
        timeRemaining: session.gameTime,
        combatants: this.getPlayerData(session),
        gpsBounds: session.gpsBounds // NEW: Send GPS bounds to clients
      },
      playerStats: this.getPlayerData(session)
    };

    
    this.broadcastToSession(session, gameState);
    this.broadcastToSpectators(session, {
      type: 'spectatorUpdate',
      gameState: {
        timeRemaining: session.gameTime,
        combatants: this.getPlayerData(session),
        battleStarted: session.battleStarted,
        gpsBounds: session.gpsBounds
      }
    });
  }

  // Retrieves player data for broadcasting
  getPlayerData(session) {
    return Array.from(session.players.values()).map(player => ({
      tag: player.name,
      color: player.color,
      points: player.stats.points,
      lives: player.stats.lives,
      health: player.stats.health,
      ammo: player.stats.ammo,
      weapons: player.stats.weapons,
      position: player.stats.position,
      gpsAvailable: player.stats.gpsAvailable, 
      gpsPosition: player.stats.gpsPosition, 
      hits: player.stats.hits,
      misses: player.stats.misses,
      eliminations: player.stats.eliminations,
      deaths: player.stats.deaths,
      isEliminated: player.stats.isEliminated,
      activePowerups: player.stats.activePowerups
    }));
  }

  // Broadcasts a message to all players in the session
  broadcastToSession(session, message) {
    const messageStr = JSON.stringify(message);
    session.players.forEach(player => {
      if (player.ws.readyState === 1) {
        player.ws.send(messageStr);
      }
    });
  }

  // Broadcasts a message to all spectators in the session
  broadcastToSpectators(session, message) {
    const messageStr = JSON.stringify(message);
    session.spectators.forEach(spectator => {
      if (spectator.ws.readyState === 1) {
        spectator.ws.send(messageStr);
      }
    });
  }

  // Removes any existing player with the same name from the session
  removePlayerFromSession(session, playerName) {
    for (const [id, player] of session.players) {
      if (player.name === playerName) {
        session.players.delete(id);
        console.log(`🗑️ Removed existing player ${playerName} from session`);
        break;
      }
    }
  }

  // Broadcasts updated session info (e.g., player list, commander) to all clients
  broadcastSessionUpdate(session) {
    const lobbyPlayers = Array.from(session.players.values())
      .filter(player => player.room === 'lobby');
    
    this.broadcastToSession(session, {
      type: 'lobbyUpdate',
      players: lobbyPlayers.map(player => ({
        tag: player.name,
        color: player.color
      })),
      commander: session.commander,
      battleStarted: session.battleStarted
    });
  }

  // Sends a message to a specific player
  sendToPlayer(ws, message) {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify(message));
    }
  }

  // Generates a random position for a player on the minimap (0-100 scale)
  generateRandomPosition() {
    return {
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100)
    };
  }
}
// Export the BattleServer class for use in other modules
export default BattleServer;