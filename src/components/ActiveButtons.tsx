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
    const opponents = gameState.lobby.players.filter(p => p.id !== player.id && p.lives > 0);
    if (opponents.length > 0) {
      const randomTarget = opponents[Math.floor(Math.random() * opponents.length)];
      onShoot(randomTarget.color);
    }
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
      background: "rgba(0, 0, 0, 0.8)",
      borderRadius: "20px",
      border: "2px solid rgba(0, 255, 255, 0.3)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 0 40px rgba(0, 255, 255, 0.3)"
    }}>
      <button
        onClick={handleShoot}
        disabled={currentPlayer.ammo <= 0}
        style={{
          padding: "25px 40px",
          border: "none",
          borderRadius: "15px",
          background: currentPlayer.ammo <= 0 
            ? "rgba(255, 107, 107, 0.3)" 
            : "linear-gradient(45deg, #ff0080, #c44569)",
          color: "white",
          fontSize: "1.3rem",
          fontWeight: "bold",
          cursor: currentPlayer.ammo <= 0 ? "not-allowed" : "pointer",
          opacity: currentPlayer.ammo <= 0 ? 0.6 : 1,
          minWidth: "180px",
          textTransform: "uppercase",
          letterSpacing: "2px",
          boxShadow: currentPlayer.ammo <= 0 ? "none" : "0 0 30px rgba(255, 0, 128, 0.5)",
          transition: "all 0.3s ease"
        }}
      >
        🔥 SHOOT
        {currentPlayer.ammo <= 0 && <div style={{fontSize: "0.8rem", opacity: 0.8}}>OUT OF AMMO</div>}
      </button>

      <button
        onClick={onReload}
        style={{
          padding: "25px 40px",
          border: "none",
          borderRadius: "15px",
          background: "linear-gradient(45deg, #00ffff, #00ff88)",
          color: "black",
          fontSize: "1.3rem",
          fontWeight: "bold",
          cursor: "pointer",
          minWidth: "180px",
          textTransform: "uppercase",
          letterSpacing: "2px",
          boxShadow: "0 0 30px rgba(0, 255, 255, 0.5)",
          transition: "all 0.3s ease"
        }}
      >
        🔄 RELOAD
      </button>

      <button style={{
        padding: "25px 40px",
        border: "none",
        borderRadius: "15px",
        background: "linear-gradient(45deg, #ff00ff, #ff0080)",
        color: "white",
        fontSize: "1.3rem",
        fontWeight: "bold",
        cursor: "pointer",
        minWidth: "180px",
        textTransform: "uppercase",
        letterSpacing: "2px",
        boxShadow: "0 0 30px rgba(255, 0, 255, 0.5)",
        transition: "all 0.3s ease"
      }}>
        ⚡ POWER
      </button>
    </div>
  );
};

export default ActionButtons;