import React from "react";
import { useGame } from "../context/GameContext";

const MiniMap: React.FC = () => {
  const { player, gameState } = useGame();

  if (!player || !gameState) return null;

  return (
    <div className="minimap-container">
      <h4>Mini Map</h4>
      <div className="minimap">
        {gameState.lobby.players.map((p) => {
          if (p.lives <= 0) return null;
          
          // Generate random positions for demo (would use real data)
          const x = Math.floor(Math.random() * 90) + 5;
          const y = Math.floor(Math.random() * 90) + 5;
          
          return (
            <div
              key={p.id}
              className={`minimap-player ${p.id === player.id ? 'current-player' : 'enemy-player'}`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                backgroundColor: p.color
              }}
              title={p.name}
            >
              {p.id === player.id && "👤"}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniMap;