import EventEmitter from 'events';

class GameSession extends EventEmitter {
  constructor(sessionId) {
    super();
    this.sessionId = sessionId;
    this.players = new Map();
    this.spectators = new Map();
    this.gameState = 'lobby'; // lobby, active, finished
    this.settings = {
      duration: 300, // 5 minutes
      maxPlayers: 8,
      pointsToWin: 1000
    };
    this.timers = new Map();
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
  }

  addPlayer(playerId, playerData) {
    if (this.players.size >= this.settings.maxPlayers) {
      throw new Error('Session is full');
    }

    if (this.gameState !== 'lobby') {
      throw new Error('Game already in progress');
    }

    // Set first player as leader
    if (this.players.size === 0) {
      playerData.isLeader = true;
    }

    this.players.set(playerId, {
      id: playerId,
      tag: playerData.tag,
      color: playerData.color,
      score: 0,
      health: 100,
      weapons: ['pistol'],
      ammo: { pistol: 12 },
      position: this.generateSpawnPoint(),
      joinedAt: Date.now(),
      ...playerData
    });

    this.updateActivity();
    this.broadcastPlayerList();
    
    this.emit('playerJoined', playerId, this.players.get(playerId));
    
    return this.players.get(playerId);
  }

  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (!player) return;

    this.players.delete(playerId);
    this.updateActivity();

    // Assign new leader if needed
    if (player.isLeader && this.players.size > 0) {
      const newLeader = Array.from(this.players.values())[0];
      newLeader.isLeader = true;
    }

    this.broadcastPlayerList();
    this.emit('playerLeft', playerId, player);

    // Cleanup if empty
    if (this.players.size === 0 && this.spectators.size === 0) {
      this.scheduleCleanup();
    }
  }

  addSpectator(spectatorId, connection) {
    this.spectators.set(spectatorId, {
      id: spectatorId,
      connection: connection,
      joinedAt: Date.now()
    });

    this.updateActivity();
    this.emit('spectatorJoined', spectatorId);
  }

  removeSpectator(spectatorId) {
    this.spectators.delete(spectatorId);
    this.updateActivity();
    this.emit('spectatorLeft', spectatorId);
  }

  startGame() {
    if (this.gameState !== 'lobby') {
      throw new Error('Game already started');
    }

    if (this.players.size < 1) {
      throw new Error('Need at least 1 player to start');
    }

    this.gameState = 'active';
    this.gameStartTime = Date.now();
    
    // Start game timer
    this.startGameTimer();
    
    // Initialize player positions
    this.initializeGamePositions();

    this.broadcastGameState();
    this.emit('gameStarted', this.sessionId);
  }

  endGame() {
    this.gameState = 'finished';
    this.gameEndTime = Date.now();
    
    // Clear timers
    this.clearTimers();

    const results = this.calculateResults();
    this.broadcastGameEnd(results);
    this.emit('gameEnded', this.sessionId, results);

    // Schedule session cleanup
    this.scheduleCleanup(60000); // Cleanup after 1 minute
  }

  processPlayerAction(playerId, action, data) {
    if (this.gameState !== 'active') return;

    const player = this.players.get(playerId);
    if (!player) return;

    switch (action) {
      case 'move':
        this.handlePlayerMove(player, data);
        break;
      case 'shoot':
        this.handlePlayerShoot(player, data);
        break;
      case 'purchase':
        this.handlePlayerPurchase(player, data);
        break;
    }

    this.updateActivity();
  }

  handlePlayerMove(player, moveData) {
    player.position = this.validatePosition(moveData.position);
    player.lastMove = Date.now();
    
    // Broadcast position update to other players
    this.broadcastToPlayers('playerMoved', {
      playerId: player.id,
      position: player.position
    }, player.id); // Exclude the moving player
  }

  handlePlayerShoot(shooter, shootData) {
    const weaponManager = this.getWeaponManager();
    
    // Check if player has the weapon and ammo
    if (!shooter.weapons.includes(shootData.weapon)) return;
    if (!weaponManager.consumeAmmo(shooter, shootData.weapon)) return;

    // Find target based on color
    const target = this.findTargetByColor(shootData.targetColor, shooter.id);
    if (!target) return;

    const damage = weaponManager.calculateWeaponDamage(shooter, shootData.weapon, target);
    if (damage > 0) {
      target.health -= damage;
      shooter.score += Math.floor(damage / 2);

      this.broadcastToAll('playerHit', {
        shooter: shooter.id,
        target: target.id,
        damage: damage,
        weapon: shootData.weapon
      });

      if (target.health <= 0) {
        this.handlePlayerElimination(target, shooter);
      }
    }

    this.checkWinCondition();
  }

  handlePlayerPurchase(player, purchaseData) {
    const weaponManager = this.getWeaponManager();
    let result;

    if (purchaseData.item in weaponManager.weaponCatalog) {
      result = weaponManager.purchaseWeapon(player, purchaseData.item);
    } else {
      result = weaponManager.purchasePowerup(player, purchaseData.item);
    }

    if (result.success) {
      this.broadcastToPlayer(player.id, 'purchaseResult', result);
    }
  }

  findTargetByColor(color, excludePlayerId) {
    return Array.from(this.players.values()).find(player => 
      player.color === color && player.id !== excludePlayerId && player.health > 0
    );
  }

  handlePlayerElimination(target, killer) {
    target.health = 0;
    killer.eliminations = (killer.eliminations || 0) + 1;

    this.broadcastToAll('playerEliminated', {
      player: target.id,
      by: killer.id
    });

    // Respawn after delay
    setTimeout(() => {
      if (this.gameState === 'active' && this.players.has(target.id)) {
        target.health = 100;
        target.position = this.generateSpawnPoint();
        this.broadcastToPlayer(target.id, 'playerRespawned', {
          position: target.position
        });
      }
    }, 5000);
  }

  checkWinCondition() {
    const scores = Array.from(this.players.values()).map(p => p.score);
    const maxScore = Math.max(...scores);
    
    if (maxScore >= this.settings.pointsToWin) {
      this.endGame();
    }
  }

  broadcastToAll(event, data, excludePlayerId = null) {
    const message = JSON.stringify({ type: event, ...data });
    
    this.players.forEach((player, playerId) => {
      if (playerId !== excludePlayerId && player.connection) {
        player.connection.send(message);
      }
    });

    this.spectators.forEach(spectator => {
      if (spectator.connection) {
        spectator.connection.send(message);
      }
    });
  }

  broadcastToPlayer(playerId, event, data) {
    const player = this.players.get(playerId);
    if (player && player.connection) {
      player.connection.send(JSON.stringify({ type: event, ...data }));
    }
  }

  generateSpawnPoint() {
    return {
      x: Math.random() * 1000,
      y: Math.random() * 1000
    };
  }

  scheduleCleanup(delay = 30000) {
    setTimeout(() => {
      if (this.players.size === 0 && this.spectators.size === 0) {
        this.emit('sessionExpired', this.sessionId);
      }
    }, delay);
  }

  updateActivity() {
    this.lastActivity = Date.now();
  }

  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      playerCount: this.players.size,
      spectatorCount: this.spectators.size,
      gameState: this.gameState,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity
    };
  }
}

export default GameSession;