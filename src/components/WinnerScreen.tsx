import React from "react";
import { useGame } from "../context/GameContext";

const WinnerScreen: React.FC = () => {
  const { gameState, setCurrentView } = useGame();

  if (!gameState) return null;

  const players = gameState.lobby.players;
  
  // Find actual winner (last player alive or highest score)
  const findRealWinner = () => {
    const alivePlayers = players.filter(p => p.lives > 0);
    
    // If there's a survivor, they win regardless of score
    if (alivePlayers.length === 1) {
      return alivePlayers[0];
    }
    
    // Otherwise, highest score wins
    return players.reduce((prev, current) => 
      (current.score > prev.score) ? current : prev
    );
  };

  const winner = findRealWinner();
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a4a 50%, #1a1a1a 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "rgba(0, 0, 0, 0.9)",
        padding: "40px",
        borderRadius: "20px",
        border: "3px solid rgba(255, 215, 0, 0.4)",
        boxShadow: "0 0 50px rgba(255, 215, 0, 0.3)",
        maxWidth: "600px",
        width: "100%",
        textAlign: "center"
      }}>
        <h1 style={{
          color: "#ffd700",
          fontSize: "3rem",
          textShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
          marginBottom: "30px"
        }}>🏆 VICTORY ACHIEVED! 🏆</h1>
        
        <div style={{
          background: "rgba(255, 215, 0, 0.1)",
          padding: "25px",
          borderRadius: "15px",
          border: "2px solid rgba(255, 215, 0, 0.3)",
          marginBottom: "30px"
        }}>
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: winner.color,
            border: "3px solid #ffd700",
            margin: "0 auto 15px",
            boxShadow: "0 0 20px rgba(255, 215, 0, 0.5)"
          }} />
          <h2 style={{
            color: "#ffd700",
            fontSize: "2rem",
            margin: "10px 0"
          }}>{winner.name}</h2>
          <p style={{ color: "#00ffff", fontSize: "1.2rem" }}>Total Score: {winner.score} points</p>
          <p style={{ color: "#ff6b6b", fontSize: "1.1rem" }}>Kills: {winner.kills} | Deaths: {winner.deaths}</p>
        </div>

        <div style={{ marginBottom: "30px" }}>
          <h3 style={{
            color: "#00ff88",
            fontSize: "1.5rem",
            textShadow: "0 0 10px rgba(0, 255, 136, 0.5)",
            marginBottom: "20px"
          }}>FINAL STANDINGS</h3>
          
          {sortedPlayers.map((player, index) => (
            <div key={player.id} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "15px",
              marginBottom: "10px",
              background: index === 0 
                ? "rgba(255, 215, 0, 0.1)" 
                : "rgba(0, 255, 255, 0.1)",
              borderRadius: "10px",
              border: index === 0 
                ? "1px solid rgba(255, 215, 0, 0.3)" 
                : "1px solid rgba(0, 255, 255, 0.3)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <span style={{
                  color: index === 0 ? "#ffd700" : "#00ffff",
                  fontWeight: "bold",
                  minWidth: "30px"
                }}>#{index + 1}</span>
                
                <div style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: player.color,
                  border: "2px solid #00ffff"
                }} />
                
                <span style={{
                  color: index === 0 ? "#ffd700" : "#00ffff",
                  fontWeight: index === 0 ? "bold" : "normal"
                }}>{player.name}</span>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <span style={{ color: "#00ff88" }}>{player.score} pts</span>
                <span style={{ color: "#ff6b6b" }}>❤️ {player.lives}</span>
                {player.lives <= 0 && <span style={{ color: "#ff6b6b" }}>💀</span>}
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setCurrentView("lobby")}
          style={{
            padding: "20px 40px",
            border: "none",
            borderRadius: "15px",
            background: "linear-gradient(45deg, #ff0080, #ff00ff)",
            color: "white",
            fontSize: "1.3rem",
            fontWeight: "bold",
            cursor: "pointer",
            width: "100%",
            boxShadow: "0 0 30px rgba(255, 0, 128, 0.4)",
            transition: "all 0.3s ease"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 0 40px rgba(255, 0, 128, 0.6)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(255, 0, 128, 0.4)";
          }}
        >
          🎮 RETURN TO LOBBY
        </button>
      </div>
    </div>
  );
};

export default WinnerScreen;