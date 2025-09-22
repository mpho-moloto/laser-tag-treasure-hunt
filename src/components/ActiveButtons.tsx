import React from "react";
import { useGame } from "../context/GameContext";

interface ActionButtonsProps {
  onShoot: (targetColor: string) => void;
  onReload: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onShoot, onReload }) => {
  const { player, gameState } = useGame();

  if (!player || !gameState) return null;

  const currentPlayer = gameState.lobby.players.find(p => p.id === player.id);
  if (!currentPlayer) return null;

  const handleShoot = () => {
    if (currentPlayer.ammo <= 0 || currentPlayer.isReloading) return;
    
    const opponents = gameState.lobby.players.filter(p => p.id !== player.id && p.lives > 0);
    if (opponents.length > 0) {
      const randomTarget = opponents[Math.floor(Math.random() * opponents.length)];
      onShoot(randomTarget.color);
    }
  };

  const handlePowerUp = () => {
    // Placeholder for power-up activation
    console.log("Power-up activated!");
  };

  return (
    <div style={{
      position: "absolute",
      bottom: "30px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      gap: "20px",
      padding: "20px",
      background: "rgba(0, 0, 0, 0.9)",
      borderRadius: "20px",
      border: "2px solid rgba(0, 255, 255, 0.4)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 0 40px rgba(0, 255, 255, 0.3)",
      zIndex: 1000
    }}>
      <button
        onClick={handleShoot}
        disabled={currentPlayer.ammo <= 0 || currentPlayer.isReloading}
        style={{
          padding: "25px 40px",
          border: "none",
          borderRadius: "15px",
          background: currentPlayer.isReloading 
            ? "rgba(255, 165, 0, 0.3)" 
            : currentPlayer.ammo <= 0 
              ? "rgba(255, 107, 107, 0.3)" 
              : "linear-gradient(45deg, #ff0080, #c44569)",
          color: "white",
          fontSize: "1.3rem",
          fontWeight: "bold",
          cursor: currentPlayer.ammo <= 0 || currentPlayer.isReloading ? "not-allowed" : "pointer",
          opacity: currentPlayer.ammo <= 0 || currentPlayer.isReloading ? 0.6 : 1,
          minWidth: "180px",
          textTransform: "uppercase",
          letterSpacing: "2px",
          boxShadow: currentPlayer.ammo <= 0 || currentPlayer.isReloading ? "none" : "0 0 30px rgba(255, 0, 128, 0.5)",
          transition: "all 0.3s ease"
        }}
      >
        {currentPlayer.isReloading ? "🔄 RELOADING..." : "🔥 SHOOT"}
        {currentPlayer.ammo <= 0 && !currentPlayer.isReloading && (
          <div style={{fontSize: "0.8rem", opacity: 0.8}}>OUT OF AMMO</div>
        )}
      </button>

      <button
        onClick={onReload}
        disabled={currentPlayer.ammo === currentPlayer.currentWeapon.ammoCapacity || currentPlayer.isReloading}
        style={{
          padding: "25px 40px",
          border: "none",
          borderRadius: "15px",
          background: currentPlayer.isReloading 
            ? "rgba(255, 165, 0, 0.3)" 
            : "linear-gradient(45deg, #00ffff, #00ff88)",
          color: currentPlayer.isReloading ? "#ffa500" : "black",
          fontSize: "1.3rem",
          fontWeight: "bold",
          cursor: currentPlayer.isReloading ? "not-allowed" : "pointer",
          minWidth: "180px",
          textTransform: "uppercase",
          letterSpacing: "2px",
          boxShadow: currentPlayer.isReloading ? "none" : "0 0 30px rgba(0, 255, 255, 0.5)",
          transition: "all 0.3s ease"
        }}
      >
        {currentPlayer.isReloading ? "🔄 RELOADING..." : "🔄 RELOAD"}
      </button>

      <button 
        onClick={handlePowerUp}
        disabled={!currentPlayer.hasPowerUp}
        style={{
          padding: "25px 40px",
          border: "none",
          borderRadius: "15px",
          background: currentPlayer.hasPowerUp 
            ? "linear-gradient(45deg, #ff00ff, #ff0080)" 
            : "rgba(128, 128, 128, 0.3)",
          color: "white",
          fontSize: "1.3rem",
          fontWeight: "bold",
          cursor: currentPlayer.hasPowerUp ? "pointer" : "not-allowed",
          opacity: currentPlayer.hasPowerUp ? 1 : 0.6,
          minWidth: "180px",
          textTransform: "uppercase",
          letterSpacing: "2px",
          boxShadow: currentPlayer.hasPowerUp ? "0 0 30px rgba(255, 0, 255, 0.5)" : "none",
          transition: "all 0.3s ease"
        }}
      >
        ⚡ POWER
        {!currentPlayer.hasPowerUp && (
          <div style={{fontSize: "0.8rem", opacity: 0.8}}>UNAVAILABLE</div>
        )}
      </button>
    </div>
  );
};

export default ActionButtons;