import React, { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import HUD from "./HUD";
import WeaponSelector from "./WeaponSelector";
import ActionButtons from "./ActiveButtons";
import MiniMap from "./MiniMap";

const GameScreen: React.FC = () => {
  const { player, gameState, shoot, reloadWeapon, setCurrentView } = useGame();
  const [gameTimer, setGameTimer] = useState(240);
  const [cameraActive, setCameraActive] = useState(true);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setGameTimer((prev) => prev <= 1 ? (clearInterval(timerInterval), setCurrentView("winner"), 0) : prev - 1);
    }, 1000);

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const video = document.getElementById("game-camera") as HTMLVideoElement;
        if (video) { video.srcObject = stream; setCameraActive(true); }
      } catch (error) { console.error("Camera error:", error); setCameraActive(false); }
    };

    startCamera();
    return () => { clearInterval(timerInterval); };
  }, [setCurrentView]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExitGame = () => { if (confirm("Abort combat mission?")) setCurrentView("lobby"); };

  if (!player || !gameState) {
    return <div style={{ background: "linear-gradient(135deg, #000000 0%, #0a0a2a 50%, #1a1a1a 100%)", minHeight: "100vh",
                         display: "flex", justifyContent: "center", alignItems: "center", color: "#00ffff" }}>
      <div style={{ fontSize: "2rem", textShadow: "0 0 20px rgba(0, 255, 255, 0.5)" }}>INITIALIZING COMBAT SYSTEMS...</div>
    </div>;
  }

  return (
    <div style={{ background: "linear-gradient(135deg, #000000 0%, #0a0a2a 50%, #1a1a1a 100%)", minHeight: "100vh", position: "relative" }}>
      
      {/* Game Header */}
      <div style={{ position: "absolute", top: "20px", left: "20px", right: "20px", display: "flex", 
                    justifyContent: "space-between", alignItems: "center", zIndex: 1000 }}>
        <button onClick={handleExitGame} style={{ padding: "12px 25px", border: "none", borderRadius: "10px",
                background: "linear-gradient(45deg, #ff6b6b, #c44569)", color: "white", fontSize: "1rem", fontWeight: "600",
                cursor: "pointer", boxShadow: "0 0 20px rgba(255, 107, 107, 0.4)" }}>← ABORT</button>
        
        <div style={{ color: "#ff0080", fontSize: "1.8rem", fontWeight: "bold", textShadow: "0 0 15px rgba(255, 0, 128, 0.6)",
                      background: "rgba(0, 0, 0, 0.6)", padding: "10px 20px", borderRadius: "10px", 
                      border: "2px solid rgba(255, 0, 128, 0.3)" }}>⏱️ {formatTime(gameTimer)}</div>
      </div>

      {/* Main Game View */}
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        {cameraActive ? (
          <video id="game-camera" autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover",
                  filter: "hue-rotate(45deg) contrast(1.2) saturate(1.3)" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center",
                        alignItems: "center", background: "rgba(0, 0, 0, 0.8)", color: "#00ffff" }}>
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🎥</div>
            <div style={{ fontSize: "1.5rem", textAlign: "center" }}>CAMERA SYSTEMS OFFLINE</div>
            <div style={{ fontSize: "1.2rem", opacity: 0.8 }}>ENGAGE VISUAL COMBAT MODE</div>
          </div>
        )}
        
        {/* Cyberpunk Crosshair */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "50px",
                      height: "50px", border: "3px solid #ff0080", borderRadius: "50%", pointerEvents: "none",
                      boxShadow: "0 0 30px rgba(255, 0, 128, 0.6)", animation: "pulse 1s infinite alternate" }}>
          <div style={{ position: "absolute", top: "50%", left: "0", right: "0", height: "3px", background: "#ff0080", transform: "translateY(-50%)" }}></div>
          <div style={{ position: "absolute", left: "50%", top: "0", bottom: "0", width: "3px", background: "#ff0080", transform: "translateX(-50%)" }}></div>
        </div>
      </div>

      {/* Game UI Components */}
      <HUD /><WeaponSelector /><ActionButtons onShoot={shoot} onReload={reloadWeapon} /><MiniMap />
    </div>
  );
};

export default GameScreen;