import React from "react";
import { useGame } from "../context/GameContext";

const MiniMap: React.FC = () => {
  const { player, gameState } = useGame();

  if (!player || !gameState) return null;

  const alivePlayers = gameState.lobby.players.filter(p => p.lives > 0);

  return (
    <div style={{
      position: "absolute",
      top: "20px",
      left: "20px",
      background: "rgba(0, 0, 0, 0.8)",
      padding: "15px",
      borderRadius: "15px",
      border: "2px solid rgba(0, 255, 255, 0.3)",
      backdropFilter: "blur(10px)",
      zIndex: 1000,
      minWidth: "150px"
    }}>
      <h4 style={{
        color: "#00ff88",
        margin: "0 0 15px 0",
        textShadow: "0 0 10px rgba(0, 255, 136, 0.5)",
        fontSize: "1rem",
        textAlign: "center"
      }}>RADAR</h4>
      
      <div style={{
        width: "120px",
        height: "120px",
        background: "rgba(0, 0, 0, 0.6)",
        border: "2px solid rgba(0, 255, 255, 0.3)",
        borderRadius: "10px",
        position: "relative",
        margin: "0 auto"
      }}>
        {alivePlayers.map((p) => {
          // Generate positions (in a real game, this would use actual player coordinates)
          const x = 50 + Math.cos((p.id % 8) * 45 * Math.PI/180) * 40;
          const y = 50 + Math.sin((p.id % 8) * 45 * Math.PI/180) * 40;
          
          return (
            <div
              key={p.id}
              style={{
                position: "absolute",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: p.color,
                border: p.id === player.id ? "2px solid #00ff88" : "2px solid #ffffff",
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
                boxShadow: p.id === player.id ? "0 0 10px rgba(0, 255, 136, 0.8)" : "0 0 5px rgba(255, 255, 255, 0.5)",
                transition: "all 0.3s ease"
              }}
              title={p.name}
            />
          );
        })}
        
        {/* Radar sweep effect */}
        <div style={{
          position: "absolute",
          top: "0",
          left: "50%",
          width: "2px",
          height: "100%",
          background: "linear-gradient(to bottom, transparent, #00ff88, transparent)",
          transformOrigin: "center",
          animation: "radarSweep 2s infinite linear",
          opacity: 0.6
        }} />
      </div>
      
      <div style={{
        marginTop: "10px",
        fontSize: "0.8rem",
        color: "#00ffff",
        textAlign: "center"
      }}>
        Targets: {alivePlayers.length}
      </div>

      <style>{`
        @keyframes radarSweep {
          from { transform: translateX(-50%) rotate(0deg); }
          to { transform: translateX(-50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MiniMap;