import React from "react";
import { useGame } from "../context/GameContext";

const HUD: React.FC = () => {
  const { gameState } = useGame();
  if (!gameState) return null;

  const currentPlayer = gameState.lobby.players[0];
  if (!currentPlayer) return null;

  const statItem = (label: string, value: any, color: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color, fontSize: "1.1rem", textShadow: `0 0 10px ${color}80` }}>{label}</span>
      <span style={{ color, fontWeight: "bold", fontSize: "1.3rem" }}>{value}</span>
    </div>
  );

  return (
    <div style={{ position: "absolute", top: "80px", right: "20px", background: "rgba(0, 0, 0, 0.85)", padding: "25px",
                  borderRadius: "15px", border: "2px solid rgba(0, 255, 255, 0.3)", backdropFilter: "blur(10px)", minWidth: "220px",
                  boxShadow: "0 0 30px rgba(0, 255, 255, 0.2)" }}>
      
      <div style={{ display: "grid", gap: "20px" }}>
        {statItem("SCORE", `🏆 ${currentPlayer.score}`, "#ffd700")}
        {statItem("AMMO", `🔫 ${currentPlayer.ammo}`, "#00b4d8")}
        {statItem("LIVES", `❤️ ${currentPlayer.lives}`, "#cf6679")}
        {statItem("WEAPON", currentPlayer.currentWeapon === "pistol" ? "🔫 PISTOL" : 
                 currentPlayer.currentWeapon === "shotgun" ? "💥 SHOTGUN" : "🏹 RIFLE", "#00ffff")}
      </div>

      {currentPlayer.hasPowerUp && (
        <div style={{ marginTop: "20px", padding: "15px", background: "linear-gradient(45deg, #ff0080, #ff00ff)", borderRadius: "10px",
                      textAlign: "center", fontWeight: "bold", fontSize: "1.1rem", animation: "neonPulse 2s infinite alternate",
                      boxShadow: "0 0 20px rgba(255, 0, 128, 0.4)" }}>⚡ POWER ACTIVE!</div>
      )}

      <div style={{ marginTop: "20px", padding: "15px", background: "rgba(0, 255, 255, 0.15)", borderRadius: "10px",
                    textAlign: "center", border: "1px solid rgba(0, 255, 255, 0.3)", fontSize: "1.1rem" }}>
        COMBATANTS: {gameState.lobby.players.filter(p => p.lives > 0).length}/{gameState.lobby.players.length}
      </div>
    </div>
  );
};

export default HUD;