class ArenaEngine {
  constructor() {
    this.weapons = {
      pistol: { damage: 15, cost: 0, ammo: 12 },
      rifle: { damage: 35, cost: 150, ammo: 30 },
      shotgun: { damage: 60, cost: 300, ammo: 8 }
    };
    
    this.powerups = {
      doubleDamage: { cost: 200, duration: 30 },
      extraLife: { cost: 150 },
      speedBoost: { cost: 100, duration: 45 }
    };
  }

  processShot(attacker, target, weaponType) {
    if (!target || target.health <= 0) return null;
    
    const weapon = this.weapons[weaponType];
    if (!weapon) return null;

    let damage = weapon.damage;
    
    // Apply powerups
    if (attacker.activePowerups.doubleDamage) {
      damage *= 2;
    }

    target.health = Math.max(0, target.health - damage);
    attacker.score += Math.floor(damage / 2);
    attacker.shotsHit++;

    const result = {
      hit: true,
      damage,
      attacker: attacker.id,
      target: target.id,
      weapon: weaponType
    };

    if (target.health <= 0) {
      result.elimination = true;
      attacker.eliminations++;
    }

    return result;
  }

  processPurchase(player, itemType) {
    const weapon = this.weapons[itemType];
    const powerup = this.powerups[itemType];
    
    if (weapon && player.score >= weapon.cost) {
      if (!player.weapons.includes(itemType)) {
        player.score -= weapon.cost;
        player.weapons.push(itemType);
        return { success: true, item: itemType, type: 'weapon' };
      }
    }
    
    if (powerup && player.score >= powerup.cost) {
      player.score -= powerup.cost;
      player.activePowerups[itemType] = powerup.duration || true;
      return { success: true, item: itemType, type: 'powerup' };
    }
    
    return { success: false, reason: 'insufficient_points' };
  }

  updatePowerups(player, deltaTime) {
    Object.keys(player.activePowerups).forEach(powerup => {
      if (typeof player.activePowerups[powerup] === 'number') {
        player.activePowerups[powerup] -= deltaTime;
        if (player.activePowerups[powerup] <= 0) {
          delete player.activePowerups[powerup];
        }
      }
    });
  }
}

export default ArenaEngine;