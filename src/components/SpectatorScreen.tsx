import React, { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";

const SpectatorScreen: React.FC = () => {
  const { gameState, setCurrentView } = useGame();
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    const startSpectatorCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        const video = document.getElementById("spectator-camera") as HTMLVideoElement;
        if (video) video.srcObject = stream;
        setCameraActive(true);
      } catch (error) {
        console.error("Spectator camera error:", error);
        setCameraActive(false);
      }
    };

    startSpectatorCamera();

    return () => {
      const video = document.getElementById("spectator-camera") as HTMLVideoElement;
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (!gameState) return null;

  const sortedPlayers = [...gameState.lobby.players].sort((a, b) => b.score - a.score);

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #000000 0%, #0a0a2a 50%, #1a1a1a 100%)",
      color: "#00ffff",
      padding: "20px"
    }}>
      
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "30px",
        padding: "20px",
        background: "rgba(0, 0, 0, 0.8)",
        borderRadius: "15px",
        border: "2px solid rgba(0, 255, 255, 0.3)"
      }}>
        <button 
          onClick={() => setCurrentView("lobby")}
          style={{
            padding: "12px 25px",
            border: "none",
            borderRadius: "10px",
            background: "linear-gradient(45deg, #ff6b6b, #c44569)",
            color: "white",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          ← BACK TO LOBBY
        </button>
        
        <h2 style={{ 
          margin: 0, 
          textShadow: "0 0 20px rgba(0, 255, 255, 0.5)",
          fontSize: "2rem"
        }}>
          👁️ SPECTATOR MODE
        </h2>
        
        <div style={{ width: "120px" }}></div> {/* Spacer for alignment */}
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 400px", 
        gap: "30px",
        height: "calc(100vh - 200px)"
      }}>
        
        {/* Camera View */}
        <div style={{ 
          background: "rgba(0, 0, 0, 0.6)", 
          borderRadius: "15px",
          border: "2px solid rgba(0, 255, 255, 0.3)",
          overflow: "hidden"
        }}>
          {cameraActive ? (
            <video
              id="spectator-camera"
              autoPlay
              playsInline
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "cover",
                filter: "hue-rotate(45deg) contrast(1.2) saturate(1.3)"
              }}
            />
          ) : (
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "center",
              alignItems: "center", 
              height: "100%", 
              color: "#00ffff",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🎥</div>
              <div style={{ fontSize: "1.5rem" }}>CAMERA SYSTEMS OFFLINE</div>
              <div style={{ fontSize: "1.2rem", opacity: 0.8 }}>SPECTATOR VIEW ONLY</div>
            </div>
          )}
        </div>

        {/* Game Information */}
        <div style={{ 
          background: "rgba(0, 0, 0, 0.8)", 
          padding: "25px",
          borderRadius: "15px",
          border: "2px solid rgba(0, 255, 255, 0.3)",
          overflowY: "auto"
        }}>
          <h3 style={{ 
            color: "#00ff88", 
            textShadow: "0 0 10px rgba(0, 255, 136, 0.5)",
            marginBottom: "25px",
            textAlign: "center"
          }}>
            BATTLE STATISTICS
          </h3>

          <div style={{ marginBottom: "25px" }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              marginBottom: "15px",
              padding: "15px",
              background: "rgba(0, 255, 255, 0.1)",
              borderRadius: "10px",
              border: "1px solid rgba(0, 255, 255, 0.2)"
            }}>
              <span>ACTIVE PLAYERS:</span>
              <strong>{gameState.lobby.players.filter(p => p.lives > 0).length}/{gameState.lobby.players.length}</strong>
            </div>
            
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              padding: "15px",
              background: "rgba(0, 255, 255, 0.1)",
              borderRadius: "10px",
              border: "1px solid rgba(0, 255, 255, 0.2)"
            }}>
              <span>GAME TIME:</span>
              <strong>{Math.floor(gameState.elapsedTime / 60)}:{(gameState.elapsedTime % 60).toString().padStart(2, '0')}</strong>
            </div>
          </div>

          <h4 style={{ 
            color: "#ff0080", 
            marginBottom: "15px",
            textAlign: "center"
          }}>
            PLAYER LEADERBOARD
          </h4>

          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {sortedPlayers.map((player, index) => (
              <div key={player.id} style={{ 
                display: "flex", 
                alignItems: "center",
                padding: "15px",
                marginBottom: "10px",
                background: player.lives > 0 ? "rgba(0, 255, 136, 0.1)" : "rgba(255, 107, 107, 0.1)",
                borderRadius: "10px",
                border: player.lives > 0 ? "1px solid rgba(0, 255, 136, 0.3)" : "1px solid rgba(255, 107, 107, 0.3)"
              }}>
                <div style={{ 
                  width: "20px", 
                  height: "20px", 
                  borderRadius: "50%", 
                  backgroundColor: player.color,
                  border: "2px solid #00ffff",
                  marginRight: "15px"
                }} />
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", color: player.lives > 0 ? "#00ff88" : "#ff6b6b" }}>
                    {player.name} {player.lives <= 0 && "💀"}
                  </div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                    K: {player.kills} | D: {player.deaths} | S: {player.score}
                  </div>
                </div>
                
                <div style={{ 
                  fontSize: "1.2rem", 
                  fontWeight: "bold",
                  color: index === 0 ? "#ffd700" : "#00ffff"
                }}>
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpectatorScreen;