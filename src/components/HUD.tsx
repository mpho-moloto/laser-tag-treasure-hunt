import React from "react";
import { useGame } from "../context/GameContext";

const HUD: React.FC = () => {
  const { gameState } = useGame();
  if (!gameState) return null;

  const currentPlayer = gameState.lobby.players[0];
  if (!currentPlayer) return null;

  const statItem = (label: string, value: any, color: string, icon: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
      <span style={{ color, fontSize: "1.1rem", textShadow: `0 0 10px ${color}80` }}>
        {icon} {label}
      </span>
      <span style={{ color, fontWeight: "bold", fontSize: "1.3rem" }}>{value}</span>
    </div>
  );

  const getWeaponDisplay = (weaponName: string) => {
    switch (weaponName) {
      case "pistol": return "🔫 PISTOL";
      case "shotgun": return "💥 SHOTGUN";
      case "rifle": return "🏹 RIFLE";
      default: return weaponName.toUpperCase();
    }
  };

  const alivePlayers = gameState.lobby.players.filter(p => p.lives > 0);
  const isGameActive = gameState.lobby.state === "active";

  return (
    <div style={{
      position: "absolute", 
      top: "80px", 
      right: "20px", 
      background: "rgba(0,0,0,0.95)", 
      padding: "25px",
      borderRadius: "15px", 
      border: "2px solid rgba(0,255,255,0.4)", 
      backdropFilter: "blur(10px)",
      minWidth: "280px", 
      boxShadow: "0 0 30px rgba(0,255,255,0.3)",
      zIndex: 1000
    }}>
      <div style={{ display: "grid", gap: "20px" }}>
        {/* Game Phase Indicator */}
        <div style={{
          padding: "10px",
          background: gameState.lobby.state === "active" 
            ? "linear-gradient(45deg, rgba(255, 0, 128, 0.2), rgba(255, 0, 255, 0.2))" 
            : "linear-gradient(45deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 255, 0.2))",
          borderRadius: "8px",
          border: gameState.lobby.state === "active" 
            ? "1px solid rgba(255, 0, 128, 0.4)" 
            : "1px solid rgba(0, 255, 136, 0.4)",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "0.9rem",
          color: gameState.lobby.state === "active" ? "#ff0080" : "#00ff88",
          textTransform: "uppercase",
          letterSpacing: "1px"
        }}>
          {gameState.lobby.state === "active" ? "⚡ BATTLE PHASE" : "🛒 PREP PHASE"}
        </div>

        {statItem("SCORE", `$${currentPlayer.score}`, "#ffd700", "🏆")}
        {statItem("AMMO", `${currentPlayer.ammo}/${currentPlayer.currentWeapon.ammoCapacity}`, "#00b4d8", "🔫")}
        {statItem("LIVES", currentPlayer.lives, "#cf6679", "❤️")}
        {statItem("WEAPON", getWeaponDisplay(currentPlayer.currentWeapon.name), "#00ffff", "⚔️")}
        
        {currentPlayer.isReloading && (
          <div style={{
            padding: "12px",
            background: "rgba(255, 165, 0, 0.3)",
            borderRadius: "8px",
            border: "1px solid rgba(255, 165, 0, 0.6)",
            textAlign: "center",
            color: "#ffa500",
            fontWeight: "bold",
            fontSize: "0.9rem",
            animation: "pulse 1s infinite"
          }}>
            🔄 RELOADING...
          </div>
        )}

        {currentPlayer.hasPowerUp && (
          <div style={{
            padding: "12px",
            background: "linear-gradient(45deg, rgba(255, 0, 128, 0.3), rgba(255, 0, 255, 0.3))",
            borderRadius: "8px",
            border: "1px solid rgba(255, 0, 128, 0.6)",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "0.9rem",
            animation: "neonPulse 1.5s infinite alternate",
            color: "#ff00ff",
            textShadow: "0 0 10px rgba(255, 0, 255, 0.5)"
          }}>
            ⚡ 2x DAMAGE ACTIVE!
          </div>
        )}

        {/* Purchase Hints - Only show during active gameplay */}
        {isGameActive && (
          <>
            {currentPlayer.score >= 200 && currentPlayer.lives < 5 && (
              <div style={{
                padding: "10px",
                background: "rgba(255, 0, 128, 0.2)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 0, 128, 0.4)",
                textAlign: "center",
                fontSize: "0.8rem",
                color: "#ff0080",
                animation: "pulse 2s infinite",
                cursor: "pointer"
              }}
              onClick={() => {/* This would trigger purchase */}}
              title="Click to buy Extra Life"
              >
                💰 CAN AFFORD EXTRA LIFE! ($200)
              </div>
            )}

            {currentPlayer.score >= 300 && !currentPlayer.weapons.some(w => w.name === "shotgun") && (
              <div style={{
                padding: "10px",
                background: "rgba(255, 100, 0, 0.2)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 100, 0, 0.4)",
                textAlign: "center",
                fontSize: "0.8rem",
                color: "#ff6400",
                animation: "pulse 2s infinite"
              }}>
                💥 SHOTGUN AVAILABLE! ($300)
              </div>
            )}

            {currentPlayer.score >= 500 && !currentPlayer.weapons.some(w => w.name === "rifle") && (
              <div style={{
                padding: "10px",
                background: "rgba(0, 150, 255, 0.2)",
                borderRadius: "8px",
                border: "1px solid rgba(0, 150, 255, 0.4)",
                textAlign: "center",
                fontSize: "0.8rem",
                color: "#0096ff",
                animation: "pulse 2s infinite"
              }}>
                🏹 RIFLE AVAILABLE! ($500)
              </div>
            )}

            {currentPlayer.score >= 1000 && !currentPlayer.hasPowerUp && (
              <div style={{
                padding: "10px",
                background: "rgba(255, 215, 0, 0.3)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 215, 0, 0.6)",
                textAlign: "center",
                fontSize: "0.8rem",
                color: "#ffd700",
                animation: "pulse 1.5s infinite",
                fontWeight: "bold"
              }}>
                ⚡ POWER-UP READY! ($1000)
              </div>
            )}
          </>
        )}

        <div style={{
          padding: "15px",
          background: "rgba(0,255,255,0.15)", 
          borderRadius: "10px",
          textAlign: "center", 
          border: "1px solid rgba(0,255,255,0.3)",
          fontSize: "1rem"
        }}>
          <div style={{ color: "#00ff88", marginBottom: "5px", fontWeight: "bold" }}>
            👥 COMBATANTS: {alivePlayers.length}/{gameState.lobby.players.length}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#00b4d8", display: "flex", justifyContent: "center", gap: "15px" }}>
            <span>K: {currentPlayer.kills}</span>
            <span>D: {currentPlayer.deaths}</span>
            <span>K/D: {currentPlayer.deaths > 0 ? (currentPlayer.kills / currentPlayer.deaths).toFixed(1) : currentPlayer.kills}</span>
          </div>
        </div>

        {/* Weapon Stats */}
        <div style={{
          padding: "12px",
          background: "rgba(0, 0, 0, 0.4)",
          borderRadius: "8px",
          border: "1px solid rgba(0, 255, 255, 0.2)",
          fontSize: "0.8rem"
        }}>
          <div style={{ color: "#00ffff", marginBottom: "8px", fontWeight: "bold" }}>WEAPON STATS:</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
            <div style={{ color: "#00b4d8" }}>Damage:</div>
            <div style={{ color: "#ffffff", textAlign: "right" }}>{currentPlayer.currentWeapon.damage}</div>
            
            <div style={{ color: "#00b4d8" }}>Fire Rate:</div>
            <div style={{ color: "#ffffff", textAlign: "right" }}>{currentPlayer.currentWeapon.fireRate}/s</div>
            
            <div style={{ color: "#00b4d8" }}>Ammo Cap:</div>
            <div style={{ color: "#ffffff", textAlign: "right" }}>{currentPlayer.currentWeapon.ammoCapacity}</div>
            
            <div style={{ color: "#00b4d8" }}>Reload:</div>
            <div style={{ color: "#ffffff", textAlign: "right" }}>{currentPlayer.currentWeapon.reloadTime}ms</div>
          </div>
        </div>

        {/* Quick Store Info */}
        {isGameActive && (
          <div style={{
            padding: "10px",
            background: "rgba(255, 0, 128, 0.1)",
            borderRadius: "8px",
            border: "1px solid rgba(255, 0, 128, 0.3)",
            textAlign: "center",
            fontSize: "0.7rem",
            color: "#ff0080"
          }}>
            💰 Store available at bottom screen
          </div>
        )}
      </div>

      <style>{`
        @keyframes neonPulse {
          from { 
            box-shadow: 0 0 10px rgba(255, 0, 128, 0.4);
            transform: scale(1);
          }
          to { 
            box-shadow: 0 0 20px rgba(255, 0, 128, 0.6);
            transform: scale(1.02);
          }
        }
        
        @keyframes pulse {
          0% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
          100% { opacity: 0.7; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default HUD;