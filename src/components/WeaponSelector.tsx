import React from "react";
import { useGame } from "../context/GameContext";
import { Weapon } from "../utils/constants";

const WeaponSelector: React.FC = () => {
  const { player, gameState, purchaseItem, switchWeapon } = useGame();
  if (!player || !gameState) return null;

  const currentPlayer = gameState.lobby.players.find(p => p.id === player.id);
  if (!currentPlayer) return null;

  const allWeapons: Weapon[] = [
    { name: "pistol", damage: 1, ammoCapacity: 6, reloadTime: 1500, fireRate: 1, cost: 0 },
    { name: "shotgun", damage: 3, ammoCapacity: 2, reloadTime: 2000, fireRate: 0.5, cost: 300 },
    { name: "rifle", damage: 2, ammoCapacity: 30, reloadTime: 2500, fireRate: 4, cost: 500 },
  ];

  const handleWeaponSelect = (weapon: Weapon) => {
    const owned = currentPlayer.weapons.find(w => w.name === weapon.name);
    if (owned) {
      switchWeapon(weapon.name);
    } else {
      purchaseItem("weapon", weapon);
    }
  };

  const emojiMap: Record<string, string> = {
    pistol: "🔫",
    shotgun: "💥", 
    rifle: "🏹"
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "15px",
      maxWidth: "600px"
    }}>
      {allWeapons.map((weapon) => {
        const isOwned = currentPlayer.weapons.some(w => w.name === weapon.name);
        const isEquipped = currentPlayer.currentWeapon.name === weapon.name;
        const canAfford = currentPlayer.score >= weapon.cost;

        return (
          <button
            key={weapon.name}
            onClick={() => handleWeaponSelect(weapon)}
            disabled={!isOwned && !canAfford}
            style={{
              padding: "20px",
              border: isEquipped ? "3px solid #00ffff" : "2px solid rgba(0, 255, 255, 0.3)",
              borderRadius: "12px",
              background: isEquipped
                ? "rgba(0, 255, 255, 0.2)"
                : isOwned
                  ? "rgba(0, 255, 136, 0.2)"
                  : "rgba(255, 0, 128, 0.2)",
              color: isEquipped ? "#00ffff" : isOwned ? "#00ff88" : "#ff0080",
              cursor: isOwned || canAfford ? "pointer" : "not-allowed",
              opacity: isOwned || canAfford ? 1 : 0.6,
              textAlign: "center",
              transition: "all 0.3s ease"
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>
              {emojiMap[weapon.name]}
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
              {weapon.name.toUpperCase()}
            </div>
            
            <div style={{ fontSize: "0.9rem", margin: "5px 0", color: "#00b4d8" }}>
              Damage: {weapon.damage} | Ammo: {weapon.ammoCapacity}
            </div>

            {!isOwned ? (
              <div style={{ 
                fontSize: "0.9rem", 
                color: canAfford ? "#00ff88" : "#ff6b6b",
                fontWeight: "bold"
              }}>
                ${weapon.cost}
              </div>
            ) : (
              <div style={{ fontSize: "0.8rem", color: "#00ff88" }}>
                {isEquipped ? "✓ EQUIPPED" : "OWNED"}
              </div>
            )}
          </button>
        );
      })}

      {/* Purchase Buttons */}
      <div style={{ gridColumn: "1 / -1", display: "grid", gap: "10px", marginTop: "10px" }}>
        <button
          onClick={() => purchaseItem("life")}
          disabled={currentPlayer.score < 200 || currentPlayer.lives >= 5}
          style={{
            padding: "15px",
            border: "2px solid rgba(255, 0, 128, 0.3)",
            borderRadius: "10px",
            background: currentPlayer.score >= 200 && currentPlayer.lives < 5 
              ? "rgba(255, 0, 128, 0.3)" 
              : "rgba(255, 107, 107, 0.2)",
            color: currentPlayer.score >= 200 && currentPlayer.lives < 5 ? "#ff0080" : "#ff6b6b",
            cursor: currentPlayer.score >= 200 && currentPlayer.lives < 5 ? "pointer" : "not-allowed",
            fontSize: "1rem",
            fontWeight: "bold"
          }}
        >
          ❤️ EXTRA LIFE - $200
          {currentPlayer.lives >= 5 && <div style={{fontSize: "0.8rem"}}>MAX LIVES</div>}
        </button>

        <button
          onClick={() => purchaseItem("powerup")}
          disabled={currentPlayer.score < 1000 || currentPlayer.hasPowerUp}
          style={{
            padding: "15px",
            border: "2px solid rgba(255, 215, 0, 0.3)",
            borderRadius: "10px",
            background: currentPlayer.score >= 1000 && !currentPlayer.hasPowerUp 
              ? "rgba(255, 215, 0, 0.3)" 
              : "rgba(255, 107, 107, 0.2)",
            color: currentPlayer.score >= 1000 && !currentPlayer.hasPowerUp ? "#ffd700" : "#ff6b6b",
            cursor: currentPlayer.score >= 1000 && !currentPlayer.hasPowerUp ? "pointer" : "not-allowed",
            fontSize: "1rem",
            fontWeight: "bold"
          }}
        >
          ⚡ POWER-UP - $1000
          {currentPlayer.hasPowerUp && <div style={{fontSize: "0.8rem"}}>ACTIVE</div>}
        </button>

        <div style={{
          padding: "10px",
          background: "rgba(0, 255, 255, 0.1)",
          borderRadius: "8px",
          textAlign: "center",
          fontSize: "0.9rem",
          color: "#00ffff"
        }}>
          Available Score: <strong>${currentPlayer.score}</strong>
        </div>
      </div>
    </div>
  );
};

export default WeaponSelector;