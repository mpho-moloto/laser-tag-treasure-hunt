class WeaponManager {
  constructor() {
    this.weaponCatalog = {
      pistol: {
        name: "Photon Pistol",
        type: "pistol",
        damage: 15,
        fireRate: 600, // ms between shots
        accuracy: 0.85,
        range: 50,
        cost: 0, // Starter weapon
        ammo: 12,
        unlockLevel: 0,
        description: "Standard issue sidearm"
      },
      rifle: {
        name: "Plasma Rifle", 
        type: "rifle",
        damage: 35,
        fireRate: 350,
        accuracy: 0.75,
        range: 100,
        cost: 150,
        ammo: 30,
        unlockLevel: 1,
        description: "Rapid-fire energy rifle"
      },
      shotgun: {
        name: "Quantum Shotgun",
        type: "shotgun", 
        damage: 60,
        fireRate: 900,
        accuracy: 0.60,
        range: 25,
        cost: 300,
        ammo: 8,
        unlockLevel: 2,
        description: "Close-range powerhouse"
      }
    };

    this.powerupStore = {
      doubleDamage: {
        name: "Damage Amplifier",
        cost: 200,
        duration: 15,
        effect: "Doubles weapon damage",
        type: "temporary"
      },
      extraLife: {
        name: "Resurrection Module", 
        cost: 150,
        effect: "Grants one additional life",
        type: "permanent"
      },
      speedBoost: {
        name: "Velocity Enhancer",
        cost: 100, 
        duration: 20,
        effect: "Increases movement speed",
        type: "temporary"
      }
    };
  }

  canPurchaseWeapon(player, weaponType) {
    const weapon = this.weaponCatalog[weaponType];
    if (!weapon) return { canBuy: false, reason: "Invalid weapon" };

    if (player.score < weapon.cost) {
      return { canBuy: false, reason: "Insufficient points" };
    }

    if (player.weapons.includes(weaponType)) {
      return { canBuy: false, reason: "Already owned" };
    }

    if (player.level < weapon.unlockLevel) {
      return { canBuy: false, reason: "Level requirement not met" };
    }

    return { canBuy: true, weapon: weapon };
  }

  purchaseWeapon(player, weaponType) {
    const purchaseCheck = this.canPurchaseWeapon(player, weaponType);
    
    if (!purchaseCheck.canBuy) {
      return { success: false, error: purchaseCheck.reason };
    }

    const weapon = purchaseCheck.weapon;
    player.score -= weapon.cost;
    player.weapons.push(weaponType);
    
    // Add initial ammo for the weapon
    if (!player.ammo) player.ammo = {};
    player.ammo[weaponType] = weapon.ammo;

    return { 
      success: true, 
      weapon: weaponType,
      newScore: player.score,
      message: `Acquired ${weapon.name}!`
    };
  }

  canPurchasePowerup(player, powerupType) {
    const powerup = this.powerupStore[powerupType];
    if (!powerup) return { canBuy: false, reason: "Invalid powerup" };

    if (player.score < powerup.cost) {
      return { canBuy: false, reason: "Insufficient points" };
    }

    // Check if player already has this powerup active
    if (powerup.type === "temporary" && player.activePowerups[powerupType]) {
      return { canBuy: false, reason: "Already active" };
    }

    return { canBuy: true, powerup: powerup };
  }

  purchasePowerup(player, powerupType) {
    const purchaseCheck = this.canPurchasePowerup(player, powerupType);
    
    if (!purchaseCheck.canBuy) {
      return { success: false, error: purchaseCheck.reason };
    }

    const powerup = purchaseCheck.powerup;
    player.score -= powerup.cost;

    if (powerup.type === "temporary") {
      player.activePowerups[powerupType] = powerup.duration;
    } else {
      // Permanent powerup - extra life
      player.lives = (player.lives || 1) + 1;
    }

    return { 
      success: true, 
      powerup: powerupType,
      newScore: player.score,
      message: `Activated ${powerup.name}!`
    };
  }

  getWeaponStats(weaponType) {
    return this.weaponCatalog[weaponType] || null;
  }

  getAvailableWeapons(player) {
    return Object.values(this.weaponCatalog).filter(weapon => 
      weapon.unlockLevel <= (player.level || 0)
    );
  }

  getPlayerWeapons(player) {
    return (player.weapons || []).map(weaponType => 
      this.weaponCatalog[weaponType]
    ).filter(Boolean);
  }

  calculateWeaponDamage(attacker, weaponType, target) {
    const weapon = this.weaponCatalog[weaponType];
    if (!weapon) return 0;

    let damage = weapon.damage;

    // Apply powerup modifiers
    if (attacker.activePowerups?.doubleDamage) {
      damage *= 2;
    }

    // Apply distance modifier
    const distance = this.calculateDistance(attacker, target);
    if (distance > weapon.range) {
      const rangePenalty = 1 - ((distance - weapon.range) / weapon.range);
      damage *= Math.max(0.1, rangePenalty);
    }

    // Apply accuracy check
    const hitChance = weapon.accuracy * this.getAccuracyModifier(attacker);
    if (Math.random() > hitChance) {
      return 0; // Miss
    }

    return Math.round(damage);
  }

  consumeAmmo(player, weaponType) {
    if (!player.ammo || !player.ammo[weaponType]) {
      return false; // No ammo available
    }

    player.ammo[weaponType]--;
    
    if (player.ammo[weaponType] <= 0) {
      // Auto-reload or return false if no reload system
      return this.reloadWeapon(player, weaponType);
    }

    return true;
  }

  reloadWeapon(player, weaponType) {
    const weapon = this.weaponCatalog[weaponType];
    if (!weapon) return false;

    player.ammo[weaponType] = weapon.ammo;
    return true;
  }

  getAccuracyModifier(player) {
    let modifier = 1.0;

    // Movement penalty
    if (player.isMoving) {
      modifier *= 0.8;
    }

    // Powerup effects
    if (player.activePowerups?.speedBoost) {
      modifier *= 0.9; // Slight accuracy penalty for speed
    }

    return modifier;
  }

  calculateDistance(attacker, target) {
    if (!attacker.position || !target.position) return 0;
    
    const dx = attacker.position.x - target.position.x;
    const dy = attacker.position.y - target.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  updatePowerupTimers(player, deltaTime) {
    if (!player.activePowerups) return;

    Object.keys(player.activePowerups).forEach(powerup => {
      if (typeof player.activePowerups[powerup] === 'number') {
        player.activePowerups[powerup] -= deltaTime;
        
        if (player.activePowerups[powerup] <= 0) {
          delete player.activePowerups[powerup];
          // Notify player of powerup expiration
          this.notifyPowerupExpired(player, powerup);
        }
      }
    });
  }

  notifyPowerupExpired(player, powerupType) {
    // This would typically send a message to the player's client
    console.log(`Powerup ${powerupType} expired for player ${player.tag}`);
  }
}

export default WeaponManager;