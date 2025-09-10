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

  return (
    <div className="spectator-container">
      <div className="spectator-header">
        <button 
          onClick={() => setCurrentView("lobby")}
          className="back-btn"
        >
          ← Back to Lobby
        </button>
        <h2>👁️ Spectator Mode</h2>
      </div>

      <div className="spectator-content">
        <div className="camera-view">
          {cameraActive ? (
            <video
              id="spectator-camera"
              autoPlay
              playsInline
              className="spectator-feed"
            />
          ) : (
            <div className="camera-placeholder">
              <p>📹 Camera not available</p>
            </div>
          )}
        </div>

        <div className="spectator-info">
          <h3>Game Information</h3>
          <p>Players: {gameState.lobby.players.length}</p>
          <p>Game Time: {Math.floor(gameState.elapsedTime / 60)}:{(gameState.elapsedTime % 60).toString().padStart(2, '0')}</p>
          
          <div className="player-list">
            {gameState.lobby.players.map(player => (
              <div key={player.id} className="spectator-player">
                <div 
                  className="player-color"
                  style={{ backgroundColor: player.color }}
                />
                <span>{player.name}</span>
                <span>Score: {player.score}</span>
                <span>Lives: {player.lives}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpectatorScreen;
