import { WebSocketServer } from 'ws';

class BattleServer {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.sessions = new Map();
    this.setupConnectionHandler();
    this.startGameLoop();
  }

  setupConnectionHandler() {
    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url, 'http://localhost');
      const pathParts = url.pathname.split('/');
      const gameCode = pathParts[2];
      const roomType = pathParts[3]; // 'lobby' or 'game'
      const playerName = url.searchParams.get('player');
      const playerColor = url.searchParams.get('color');

      if (!gameCode || !playerName) {
        ws.close(1000, 'Game code and player name required');
        return;
      }

      // Get or create session
      let session = this.sessions.get(gameCode);
      if (!session) {
        session = {
          players: new Map(),
          commander: null,
          gameState: 'lobby',
          battleStarted: false,
          gameTime: 300, // 5 minutes
          lastUpdate: Date.now()
        };
        this.sessions.set(gameCode, session);
        console.log(`🎮 New session: ${gameCode}`);
      }

      const playerId = `${playerName}-${Date.now()}`;

      // Remove player from any existing connections
      this.removePlayerFromSession(session, playerName);

      // Add new player connection
      session.players.set(playerId, {
        id: playerId,
        name: playerName,
        color: playerColor,
        ws: ws,
        room: roomType || 'lobby',
        stats: {
          points: 0,
          lives: 3,
          ammo: 12,
          weapons: ['pistol'],
          position: this.generateRandomPosition(),
          lastShot: 0
        }
      });

      // Set first player as commander
      if (!session.commander) {
        session.commander = playerName;
      }

      // Handle battle start redirect
      if (session.battleStarted && roomType === 'lobby') {
        this.sendToPlayer(ws, { type: 'redirectToBattle' });
      }

      this.broadcastSessionUpdate(session);

      // Message handling
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
        session.players.delete(playerId);
        
        // Assign new commander if needed
        if (session.commander === playerName && session.players.size > 0) {
          const remainingPlayers = Array.from(session.players.values());
          session.commander = remainingPlayers[0].name;
        }
        
        this.broadcastSessionUpdate(session);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for ${playerName}:`, error);
      });
    });
  }

  handleMessage(session, playerId, message) {
    const player = session.players.get(playerId);
    
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
      case 'move':
        this.handleMove(session, player, message);
        break;
    }
  }

  handleStartBattle(session, player) {
    if (player.name === session.commander && !session.battleStarted) {
      session.battleStarted = true;
      session.gameState = 'battle';
      session.gameTime = 300; // 5 minutes
      
      // Initialize all players for battle
      session.players.forEach(player => {
        player.stats = {
          points: 0,
          lives: 3,
          ammo: 12,
          weapons: ['pistol'],
          position: this.generateRandomPosition(),
          lastShot: 0
        };
      });

      // Send battle start to ALL players
      this.broadcastToSession(session, {
        type: 'battleStart',
        players: this.getPlayerData(session)
      });
      
      console.log(`⚔️ Battle started for session by ${player.name}`);
    }
  }

  handleFire(session, shooter, message) {
    const now = Date.now();
    const shotCooldown = 500; // 0.5 seconds between shots

    // Check cooldown and ammo
    if (now - shooter.stats.lastShot < shotCooldown) return;
    if (shooter.stats.ammo <= 0) return;

    // Consume ammo
    shooter.stats.ammo--;
    shooter.stats.lastShot = now;

    // Find target based on color
    let target = null;
    session.players.forEach(player => {
      if (player.color === message.targetColor && player.name !== shooter.name) {
        target = player;
      }
    });

    if (target) {
      // Calculate damage based on weapon
      const weaponDamage = {
        pistol: 10,
        rifle: 25,
        shotgun: 40
      };

      const damage = weaponDamage[message.weapon] || 10;
      shooter.stats.points += damage;
      
      // Send hit confirmation to shooter
      this.sendToPlayer(shooter.ws, {
        type: 'hitConfirmed',
        damage: damage,
        points: shooter.stats.points,
        target: target.name
      });

      // Send hit notification to target
      this.sendToPlayer(target.ws, {
        type: 'playerHit',
        damage: damage,
        shooter: shooter.name
      });

      console.log(`🎯 ${shooter.name} hit ${target.name} for ${damage} damage`);
    }

    // Update all players
    this.broadcastArenaUpdate(session);
  }

  handlePurchase(session, player, message) {
    const shopItems = {
      rifle: { cost: 150, ammo: 30 },
      shotgun: { cost: 300, ammo: 8 },
      life: { cost: 100, type: 'life' }
    };

    const item = shopItems[message.item];
    if (!item) return;

    if (player.stats.points >= item.cost) {
      player.stats.points -= item.cost;

      if (item.type === 'life') {
        player.stats.lives++;
      } else {
        if (!player.stats.weapons.includes(message.item)) {
          player.stats.weapons.push(message.item);
        }
        player.stats.ammo = item.ammo;
      }

      this.sendToPlayer(player.ws, {
        type: 'purchaseSuccess',
        item: message.item,
        points: player.stats.points
      });

      this.broadcastArenaUpdate(session);
    }
  }

  handleMove(session, player, message) {
    if (message.position) {
      player.stats.position = message.position;
      this.broadcastArenaUpdate(session);
    }
  }

  broadcastArenaUpdate(session) {
    this.broadcastToSession(session, {
      type: 'arenaUpdate',
      gameState: {
        timeRemaining: session.gameTime,
        combatants: this.getPlayerData(session)
      },
      playerStats: this.getPlayerData(session)
    });
  }

  getPlayerData(session) {
    return Array.from(session.players.values()).map(player => ({
      tag: player.name,
      color: player.color,
      points: player.stats.points,
      lives: player.stats.lives,
      ammo: player.stats.ammo,
      weapons: player.stats.weapons,
      position: player.stats.position
    }));
  }

  startGameLoop() {
    setInterval(() => {
      this.sessions.forEach((session, gameCode) => {
        if (session.battleStarted) {
          // Update game time
          session.gameTime--;
          
          // Broadcast game state every second
          this.broadcastArenaUpdate(session);

          // End game if time runs out
          if (session.gameTime <= 0) {
            this.endGame(session);
          }
        }
      });
    }, 1000);
  }

  endGame(session) {
    session.battleStarted = false;
    session.gameState = 'finished';
    
    this.broadcastToSession(session, {
      type: 'gameEnd',
      results: this.getPlayerData(session).sort((a, b) => b.points - a.points)
    });
  }

  removePlayerFromSession(session, playerName) {
    for (const [id, player] of session.players) {
      if (player.name === playerName) {
        session.players.delete(id);
        console.log(`🔄 Removed duplicate connection for ${playerName}`);
        break;
      }
    }
  }

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

  broadcastToSession(session, message) {
    const messageStr = JSON.stringify(message);
    session.players.forEach(player => {
      if (player.ws.readyState === 1) { // OPEN
        player.ws.send(messageStr);
      }
    });
  }

  sendToPlayer(ws, message) {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify(message));
    }
  }

  generateRandomPosition() {
    return {
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100)
    };
  }
}

export default BattleServer;