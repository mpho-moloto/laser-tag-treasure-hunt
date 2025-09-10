import React from "react";
import { useGame } from "../context/GameContext";

const WinnerScreen: React.FC = () => {
  const { gameState, setCurrentView } = useGame();

  if (!gameState) return null;

  // Find winner (player with most lives/score)
  const players = gameState.lobby.players;
  const winner = players.reduce((prev, current) => 
    (current.score > prev.score) ? current : prev
  );

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="winner-container">
      <div className="winner-card">
        <h1>🏆 Game Over! 🏆</h1>
        
        <div className="winner-info">
          <div 
            className="winner-color"
            style={{ backgroundColor: winner.color }}
          />
          <h2>Winner: {winner.name}</h2>
          <p>Score: {winner.score} points</p>
        </div>

        <div className="leaderboard">
          <h3>Final Scores</h3>
          {sortedPlayers.map((player, index) => (
            <div key={player.id} className="leaderboard-item">
              <span className="rank">#{index + 1}</span>
              <div 
                className="player-color"
                style={{ backgroundColor: player.color }}
              />
              <span className="player-name">{player.name}</span>
              <span className="player-score">{player.score} pts</span>
              <span className="player-lives">❤️ {player.lives}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setCurrentView("lobby")}
          className="play-again-btn"
        >
          🎮 Play Again
        </button>
      </div>
    </div>
  );
};

export default WinnerScreen;