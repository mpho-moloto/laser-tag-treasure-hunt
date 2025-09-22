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

  return (
    <div style={{
      position: "absolute", 
      top: "80px", 
      right: "20px", 
      background: "rgba(0,0,0,0.9)", 
      padding: "25px",
      borderRadius: "15px", 
      border: "2px solid rgba(0,255,255,0.4)", 
      backdropFilter: "blur(10px)",
      minWidth: "250px", 
      boxShadow: "0 0 30px rgba(0,255,255,0.3)",
      zIndex: 1000
    }}>
      <div style={{ display: "grid", gap: "20px" }}>
        {statItem("SCORE", currentPlayer.score, "#ffd700", "🏆")}
        {statItem("AMMO", `${currentPlayer.ammo}/${currentPlayer.currentWeapon.ammoCapacity}`, "#00b4d8", "🔫")}
        {statItem("LIVES", currentPlayer.lives, "#cf6679", "❤️")}
        {statItem("WEAPON", getWeaponDisplay(currentPlayer.currentWeapon.name), "#00ffff", "⚔️")}
        
        {currentPlayer.isReloading && (
          <div style={{
            padding: "12px",
            background: "rgba(255, 165, 0, 0.2)",
            borderRadius: "8px",
            border: "1px solid rgba(255, 165, 0, 0.4)",
            textAlign: "center",
            color: "#ffa500",
            fontWeight: "bold",
            fontSize: "0.9rem"
          }}>
            🔄 RELOADING...
          </div>
        )}

        {currentPlayer.hasPowerUp && (
          <div style={{
            padding: "12px",
            background: "linear-gradient(45deg, rgba(255, 0, 128, 0.2), rgba(255, 0, 255, 0.2))",
            borderRadius: "8px",
            border: "1px solid rgba(255, 0, 128, 0.4)",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "0.9rem",
            animation: "neonPulse 2s infinite alternate",
            color: "#ff00ff"
          }}>
            ⚡ POWER BOOST ACTIVE!
          </div>
        )}

        <div style={{
          padding: "15px",
          background: "rgba(0,255,255,0.15)", 
          borderRadius: "10px",
          textAlign: "center", 
          border: "1px solid rgba(0,255,255,0.3)",
          fontSize: "1rem"
        }}>
          <div style={{ color: "#00ff88", marginBottom: "5px" }}>
            COMBATANTS: {alivePlayers.length}/{gameState.lobby.players.length}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#00b4d8" }}>
            K: {currentPlayer.kills} | D: {currentPlayer.deaths}
          </div>
        </div>

        {/* Weapon Info */}
        <div style={{
          padding: "12px",
          background: "rgba(0, 0, 0, 0.4)",
          borderRadius: "8px",
          border: "1px solid rgba(0, 255, 255, 0.2)",
          fontSize: "0.8rem"
        }}>
          <div style={{ color: "#00ffff", marginBottom: "5px" }}>WEAPON STATS:</div>
          <div style={{ color: "#00b4d8" }}>DMG: {currentPlayer.currentWeapon.damage}</div>
          <div style={{ color: "#00b4d8" }}>FIRE RATE: {currentPlayer.currentWeapon.fireRate}/s</div>
        </div>
      </div>

      <style>{`
        @keyframes neonPulse {
          from { box-shadow: 0 0 10px rgba(255, 0, 128, 0.4); }
          to { box-shadow: 0 0 20px rgba(255, 0, 128, 0.6); }
        }
      `}</style>
    </div>
  );
};

export default HUD;
