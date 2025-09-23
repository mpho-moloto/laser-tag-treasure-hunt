import React from "react";
import { useGame } from "../context/GameContext";

const MiniMap: React.FC = () => {
  const { player, gameState } = useGame();

  if (!player || !gameState) return null;

  const alivePlayers = gameState.lobby.players.filter(p => p.lives > 0);

  // Generate positions based on player ID (simulated movement)
  const getPlayerPosition = (playerId: number, index: number) => {
    // Simulate movement based on game time and player ID
    const time = Date.now() / 1000;
    const angle = (time * 0.5 + playerId * 0.3) % (2 * Math.PI);
    const distance = 30 + (playerId % 20); // Vary distance
    
    const x = 50 + Math.cos(angle) * distance;
    const y = 50 + Math.sin(angle) * distance;
    
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  return (
    <div style={{
      position: "absolute",
      top: "20px",
      left: "20px",
      background: "rgba(0, 0, 0, 0.9)",
      padding: "15px",
      borderRadius: "15px",
      border: "2px solid rgba(0, 255, 255, 0.4)",
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
      }}>📍 RADAR</h4>
      
      <div style={{
        width: "120px",
        height: "120px",
        background: "radial-gradient(circle, rgba(0, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.8) 70%)",
        border: "2px solid rgba(0, 255, 255, 0.3)",
        borderRadius: "10px",
        position: "relative",
        margin: "0 auto"
      }}>
        {alivePlayers.map((p, index) => {
          const position = getPlayerPosition(p.id, index);
          
          return (
            <div
              key={p.id}
              style={{
                position: "absolute",
                width: p.id === player.id ? "16px" : "12px",
                height: p.id === player.id ? "16px" : "12px",
                borderRadius: "50%",
                backgroundColor: p.color,
                border: p.id === player.id ? "2px solid #00ff88" : "2px solid #ffffff",
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: "translate(-50%, -50%)",
                boxShadow: p.id === player.id 
                  ? "0 0 15px rgba(0, 255, 136, 0.8)" 
                  : "0 0 8px rgba(255, 255, 255, 0.6)",
                transition: "all 0.5s ease",
                zIndex: p.id === player.id ? 2 : 1
              }}
              title={`${p.name}${p.id === player.id ? ' (YOU)' : ''}`}
            >
              {p.id === player.id && "👤"}
            </div>
          );
        })}
        
        {/* Radar sweep */}
        <div style={{
          position: "absolute",
          top: "0",
          left: "50%",
          width: "2px",
          height: "100%",
          background: "linear-gradient(to bottom, transparent, #00ff88, transparent)",
          transformOrigin: "center",
          animation: "radarSweep 3s infinite linear",
          opacity: 0.6
        }} />
      </div>
      
      <div style={{
        marginTop: "10px",
        fontSize: "0.8rem",
        color: "#00ffff",
        textAlign: "center"
      }}>
        Targets: {alivePlayers.length - 1}
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