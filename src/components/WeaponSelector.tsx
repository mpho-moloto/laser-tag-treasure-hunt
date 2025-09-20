import React from "react";
import { useGame } from "../context/GameContext";
import { Weapon } from "../../server/types";

const WeaponSelector: React.FC = () => {
  const { player, gameState, purchaseItem } = useGame();

  if (!player || !gameState) return null;

  const currentPlayer = gameState.lobby.players.find(p => p.id === player.id);
  if (!currentPlayer) return null;

  const weapons = {
    pistol: { name: "PISTOL", emoji: "🔫", cost: 0 },
    shotgun: { name: "SHOTGUN", emoji: "💥", cost: 300 },
    rifle: { name: "RIFLE", emoji: "🏹", cost: 500 }
  };

  const handleWeaponSelect = (weapon: Weapon) => {
    if (currentPlayer.weapons.includes(weapon)) {
      // Switch to owned weapon
      console.log("Switching to:", weapon);
    } else {
      // Purchase new weapon
      purchaseItem("weapon", weapon);
    }
  };

  return (
    <div style={{
      position: "absolute",
      bottom: "120px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(0, 0, 0, 0.85)",
      padding: "20px",
      borderRadius: "15px",
      border: "2px solid rgba(0, 255, 255, 0.3)",
      backdropFilter: "blur(10px)",
      display: "flex",
      gap: "15px",
      boxShadow: "0 0 30px rgba(0, 255, 255, 0.2)"
    }}>
      <h4 style={{
        color: "#00ff88",
        marginRight: "15px",
        textShadow: "0 0 10px rgba(0, 255, 136, 0.5)"
      }}>WEAPONS</h4>
      
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {Object.entries(weapons).map(([key, weapon]) => {
          const weaponKey = key as Weapon;
          const isOwned = currentPlayer.weapons.includes(weaponKey);
          const isEquipped = currentPlayer.currentWeapon === weaponKey;
          const canAfford = currentPlayer.score >= weapon.cost;

          return (
            <button
              key={weaponKey}
              onClick={() => handleWeaponSelect(weaponKey)}
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
              <div style={{ fontSize: "1.5rem", marginBottom: "5px" }}>{weapon.emoji}</div>
              <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>{weapon.name}</div>
              
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
    </div>
  );
};

export default WeaponSelector;