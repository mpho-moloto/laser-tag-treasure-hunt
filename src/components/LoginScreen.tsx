import React, { useEffect, useRef, useState } from "react";
import { useGame } from "../context/GameContext";
import { getDominantColor } from "../utils/colorDetection";
import { Player, Weapon, WEAPONS } from "../utils/constants";

const LoginScreen: React.FC = () => {
  const { setPlayer, setCurrentView } = useGame();
  const [playerName, setPlayerName] = useState("");
  const [detectedColor, setDetectedColor] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"play" | "spectate" | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => { 
    if (mode === "play") {
      startCamera();
    }
  }, [mode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { 
      setError("Camera access denied. Please allow camera permissions.");
      setMode(null);
    }
  };

  const handleScan = async () => {
    if (!videoRef.current) return;
    setScanning(true); 
    setError("");
    try { 
      setDetectedColor(await getDominantColor(videoRef.current)); 
    } catch { 
      setError("Failed to detect color. Ensure good lighting and try again."); 
    } finally { 
      setScanning(false); 
    }
  };

  const handleRescan = () => { 
    setDetectedColor(null); 
    setError(""); 
  };

  const handleConfirm = () => {
    if (!playerName || !detectedColor) return;
    
    const pistolWeapon = WEAPONS.find(w => w.name === "pistol")!;
    
    const newPlayer: Player = { 
      id: Date.now(), 
      name: playerName, 
      color: detectedColor, 
      score: 0,
      weapons: [pistolWeapon], 
      currentWeapon: pistolWeapon, 
      ammo: pistolWeapon.ammoCapacity, 
      lives: 3,
      hasPowerUp: false,
      isSpectator: false,
      isReady: false,
      lastShotTime: 0,
      isReloading: false,
      kills: 0,
      deaths: 0
    };
    
    setPlayer(newPlayer); 
    setCurrentView("lobby");
  };

  const handleSpectate = () => {
    const pistolWeapon = WEAPONS.find(w => w.name === "pistol")!;
    
    const spectatorPlayer: Player = {
      id: Date.now(),
      name: playerName || "Spectator",
      color: "#888888",
      score: 0,
      weapons: [],
      currentWeapon: pistolWeapon,
      ammo: 0,
      lives: 0,
      hasPowerUp: false,
      isSpectator: true,
      isReady: false,
      lastShotTime: 0,
      isReloading: false,
      kills: 0,
      deaths: 0
    };
    
    setPlayer(spectatorPlayer);
    setCurrentView("lobby");
  };

  const cyberpunkText = (color: string, size: string, shadow: string) => ({ 
    color, fontSize: size, textShadow: shadow, fontWeight: 'bold' 
  });

  const cyberpunkButton = (gradient: string, textColor: string, disabled = false) => ({
    padding: '20px', border: 'none', borderRadius: '15px', background: gradient,
    color: textColor, fontSize: '1.1rem', fontWeight: '600', 
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1,
    width: '100%', margin: '10px 0'
  });

  // Initial choice screen
  if (mode === null) {
    return (
      <div style={{ maxWidth: "500px", margin: "20px", padding: "40px", background: "rgba(0, 0, 0, 0.8)", 
                    borderRadius: "20px", border: "2px solid rgba(0, 255, 255, 0.3)", backdropFilter: "blur(10px)" }}>
        
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={cyberpunkText('#00ffff', '3rem', '0 0 30px rgba(0, 255, 255, 0.5)')}>⚡ NEON LASER ARENA</h1>
          <p style={cyberpunkText('rgba(0, 255, 255, 0.8)', '1.1rem', '0 0 10px rgba(0, 255, 255, 0.5)')}>
            CHOOSE YOUR ENTRY MODE
          </p>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <input 
            type="text" 
            placeholder="ENTER YOUR CODENAME" 
            value={playerName} 
            onChange={(e) => setPlayerName(e.target.value)}
            style={{ 
              width: "100%", padding: "20px", border: "2px solid rgba(0, 255, 255, 0.3)", borderRadius: "15px",
              background: "rgba(0, 0, 0, 0.6)", color: "#00ffff", fontSize: "1.1rem", textAlign: "center" 
            }} 
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <button 
            onClick={() => setMode("play")} 
            disabled={!playerName}
            style={cyberpunkButton('linear-gradient(45deg, #ff0080, #ff00ff)', 'white', !playerName)}
          >
            🎮 JOIN BATTLE
          </button>
          
          <button 
            onClick={handleSpectate}
            style={cyberpunkButton('linear-gradient(45deg, #00ffff, #00ff88)', 'black')}
          >
            👁️ SPECTATE BATTLES
          </button>
        </div>
      </div>
    );
  }

  // Player color scanning screen
  if (mode === "play") {
    return (
      <div style={{ maxWidth: "500px", margin: "20px", padding: "40px", background: "rgba(0, 0, 0, 0.8)", 
                    borderRadius: "20px", border: "2px solid rgba(0, 255, 255, 0.3)", backdropFilter: "blur(10px)" }}>
        
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={cyberpunkText('#00ffff', '2.5rem', '0 0 30px rgba(0, 255, 255, 0.5)')}>SCAN YOUR COLOR IDENTITY</h1>
          <p style={cyberpunkText('rgba(0, 255, 255, 0.8)', '1.1rem', '0 0 10px rgba(0, 255, 255, 0.5)')}>
            HOLD AN OBJECT WITH YOUR UNIQUE COLOR IN FRONT OF THE CAMERA
          </p>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            style={{ 
              width: "100%", height: "250px", borderRadius: "15px",
              background: "rgba(0, 0, 0, 0.6)", border: "3px solid rgba(0, 255, 255, 0.3)", objectFit: "cover" 
            }} 
          />
          
          {detectedColor && (
            <div style={{ 
              display: "flex", alignItems: "center", justifyContent: "center", gap: "15px", marginTop: "15px",
              padding: "15px", background: "rgba(0, 0, 0, 0.7)", border: "2px solid rgba(255, 0, 128, 0.3)",
              borderRadius: "15px", animation: "neonPulse 2s infinite alternate" 
            }}>
              <div style={{ 
                width: "40px", height: "40px", borderRadius: "8px", border: "2px solid #00ffff", 
                backgroundColor: detectedColor 
              }} />
              <span style={{ color: "#00ffff" }}>COLOR CAPTURED</span>
              <button 
                onClick={handleRescan} 
                style={{ 
                  padding: "8px 12px", background: "rgba(255, 0, 128, 0.3)",
                  border: "1px solid #ff0080", borderRadius: "5px", color: "#ff0080", cursor: "pointer" 
                }}
              >
                RESCAN
              </button>
            </div>
          )}
        </div>

        {error && (
          <div style={{ 
            color: "#ff6b6b", background: "rgba(255, 107, 107, 0.1)", padding: "15px", borderRadius: "10px",
            margin: "15px 0", borderLeft: "4px solid #ff6b6b" 
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {!detectedColor ? (
            <button 
              onClick={handleScan} 
              disabled={scanning} 
              style={cyberpunkButton('linear-gradient(45deg, #ff0080, #ff00ff)', 'white', scanning)}
            >
              {scanning ? "🔄 SCANNING..." : "🎨 SCAN COLOR SIGNATURE"}
            </button>
          ) : (
            <button 
              onClick={handleConfirm} 
              disabled={!playerName} 
              style={cyberpunkButton('linear-gradient(45deg, #00ffff, #00ff88)', 'black', !playerName)}
            >
              ⚡ INITIATE COMBAT SEQUENCE
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default LoginScreen;