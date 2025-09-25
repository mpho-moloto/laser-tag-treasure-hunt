class CombatEngine {
  constructor() {
    this.weaponStats = {
      pistol: { baseDamage: 12, fireRate: 600, accuracy: 0.85 },
      rifle: { baseDamage: 28, fireRate: 350, accuracy: 0.75 },
      shotgun: { baseDamage: 45, fireRate: 900, accuracy: 0.60 }
    };

    this.powerupEffects = {
      doubleDamage: { multiplier: 2.0, duration: 15 },
      rapidFire: { fireRate: 0.5, duration: 20 },
      healthBoost: { health: 50, permanent: true }
    };
  }

  calculateHit(shooter, target, weaponType) {
    const weapon = this.weaponStats[weaponType];
    if (!weapon) return { hit: false, reason: 'invalid_weapon' };

    // Accuracy check
    const hitChance = weapon.accuracy * this.getAccuracyModifier(shooter);
    if (Math.random() > hitChance) {
      return { hit: false, reason: 'miss' };
    }

    // Damage calculation
    let damage = weapon.baseDamage;
    damage = this.applyPowerupEffects(shooter, damage);
    damage = this.applyDistanceModifier(shooter, target, damage);
    damage = Math.max(1, Math.round(damage));

    return {
      hit: true,
      damage: damage,
      critical: this.checkCriticalHit(),
      weapon: weaponType
    };
  }

  processPurchase(player, itemType, cost) {
    if (player.score < cost) {
      return { success: false, error: 'insufficient_score' };
    }

    if (this.weaponStats[itemType]) {
      return this.purchaseWeapon(player, itemType, cost);
    }

    if (this.powerupEffects[itemType]) {
      return this.purchasePowerup(player, itemType, cost);
    }

    return { success: false, error: 'invalid_item' };
  }

  purchaseWeapon(player, weaponType, cost) {
    if (player.weapons.includes(weaponType)) {
      return { success: false, error: 'already_owned' };
    }

    player.score -= cost;
    player.weapons.push(weaponType);
    
    return { 
      success: true, 
      item: weaponType, 
      type: 'weapon',
      message: `${weaponType.toUpperCase()} acquired!`
    };
  }

  purchasePowerup(player, powerupType, cost) {
    const powerup = this.powerupEffects[powerupType];
    
    player.score -= cost;
    
    if (powerup.permanent) {
      if (powerup.health) player.health += powerup.health;
    } else {
      player.activePowerups[powerupType] = powerup.duration;
    }

    return { 
      success: true, 
      item: powerupType, 
      type: 'powerup',
      duration: powerup.duration
    };
  }

  updatePlayerStatus(player, deltaTime) {
    // Update powerup timers
    Object.keys(player.activePowerups).forEach(powerup => {
      player.activePowerups[powerup] -= deltaTime;
      if (player.activePowerups[powerup] <= 0) {
        delete player.activePowerups[powerup];
        // Notify player powerup expired
      }
    });

    // Regenerate health if no recent damage
    if (!player.recentDamage || player.recentDamage < Date.now() - 10000) {
      player.health = Math.min(100, player.health + deltaTime * 0.1);
    }
  }

  getAccuracyModifier(player) {
    let modifier = 1.0;
    
    if (player.activePowerups.rapidFire) {
      modifier *= 0.8; // Lower accuracy during rapid fire
    }
    
    if (player.movementSpeed > 5) {
      modifier *= 0.7; // Lower accuracy while moving fast
    }

    return modifier;
  }

  applyPowerupEffects(player, baseDamage) {
    let damage = baseDamage;
    
    if (player.activePowerups.doubleDamage) {
      damage *= 2;
    }

    return damage;
  }

  applyDistanceModifier(shooter, target, damage) {
    const distance = this.calculateDistance(shooter.position, target.position);
    const maxEffectiveRange = 50; // units
    
    if (distance > maxEffectiveRange) {
      const rangePenalty = 1 - ((distance - maxEffectiveRange) / 100);
      return Math.max(damage * 0.3, damage * rangePenalty);
    }
    
    return damage;
  }

  calculateDistance(pos1, pos2) {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
  }

  checkCriticalHit() {
    return Math.random() < 0.1; // 10% critical chance
  }
}

export default CombatEngine;