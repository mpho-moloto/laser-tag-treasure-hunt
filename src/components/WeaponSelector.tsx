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

  const getWeaponDisplay = (weaponName: string) => {
    switch (weaponName) {
      case "pistol": return "🔫 PISTOL";
      case "shotgun": return "💥 SHOTGUN";
      case "rifle": return "🏹 RIFLE";
      default: return weaponName.toUpperCase();
    }
  };

  return (
    <div style={{
      position: "absolute",
      bottom: "120px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(0, 0, 0, 0.95)",
      padding: "20px",
      borderRadius: "15px",
      border: "2px solid rgba(0, 255, 255, 0.4)",
      backdropFilter: "blur(10px)",
      display: "flex",
      gap: "15px",
      boxShadow: "0 0 40px rgba(0, 255, 255, 0.3)",
      zIndex: 1000
    }}>
      <h4 style={{
        color: "#00ff88",
        marginRight: "15px",
        textShadow: "0 0 10px rgba(0, 255, 136, 0.5)",
        whiteSpace: "nowrap"
      }}>ARMORY</h4>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {allWeapons.map((weapon) => {
          const isOwned = currentPlayer.weapons.some(w => w.name === weapon.name);
          const isEquipped = currentPlayer.currentWeapon.name === weapon.name;
          const canAfford = currentPlayer.score >= weapon.cost;

          const emojiMap: Record<string, string> = {
            pistol: "🔫",
            shotgun: "💥",
            rifle: "🏹"
          };

          return (
            <button
              key={weapon.name}
              onClick={() => handleWeaponSelect(weapon)}
              disabled={!isOwned && !canAfford}
              style={{
                padding: "15px",
                border: isEquipped ? "2px solid #00ffff" : "2px solid rgba(0, 255, 255, 0.3)",
                borderRadius: "10px",
                background: isEquipped
                  ? "rgba(0, 255, 255, 0.2)"
                  : isOwned
                    ? "rgba(0, 255, 136, 0.2)"
                    : "rgba(255, 0, 128, 0.2)",
                color: isEquipped ? "#00ffff" : isOwned ? "#00ff88" : "#ff0080",
                cursor: isOwned || canAfford ? "pointer" : "not-allowed",
                opacity: isOwned || canAfford ? 1 : 0.6,
                minWidth: "100px",
                textAlign: "center",
                transition: "all 0.3s ease"
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "5px" }}>
                {emojiMap[weapon.name]}
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>{weapon.name.toUpperCase()}</div>

              {!isOwned && (
                <div style={{ fontSize: "0.8rem", opacity: 0.8, marginTop: "5px" }}>
                  ${weapon.cost}
                </div>
              )}

              {isEquipped && (
                <div style={{
                  fontSize: "0.7rem",
                  color: "#00ffff",
                  marginTop: "5px",
                  textShadow: "0 0 5px rgba(0, 255, 255, 0.5)"
                }}>
                  ✓ EQUIPPED
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Purchase Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <button
          onClick={() => purchaseItem("life")}
          disabled={currentPlayer.score < 200}
          style={{
            padding: "10px 15px",
            border: "2px solid rgba(255, 0, 128, 0.3)",
            borderRadius: "8px",
            background: currentPlayer.score >= 200 ? "rgba(255, 0, 128, 0.3)" : "rgba(255, 107, 107, 0.2)",
            color: "#ff0080",
            cursor: currentPlayer.score >= 200 ? "pointer" : "not-allowed",
            fontSize: "0.8rem"
          }}
        >
          ❤️ EXTRA LIFE ($200)
        </button>

        <button
          onClick={() => purchaseItem("powerup")}
          disabled={currentPlayer.score < 1000 || currentPlayer.hasPowerUp}
          style={{
            padding: "10px 15px",
            border: "2px solid rgba(255, 215, 0, 0.3)",
            borderRadius: "8px",
            background: currentPlayer.score >= 1000 && !currentPlayer.hasPowerUp ? "rgba(255, 215, 0, 0.3)" : "rgba(255, 107, 107, 0.2)",
            color: "#ffd700",
            cursor: currentPlayer.score >= 1000 && !currentPlayer.hasPowerUp ? "pointer" : "not-allowed",
            fontSize: "0.8rem"
          }}
        >
          ⚡ POWER-UP ($1000)
        </button>
      </div>
    </div>
  );
};

export default WeaponSelector;