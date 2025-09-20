import React, { useEffect, useRef, useState } from "react";
import { useGame } from "../context/GameContext";
import { getDominantColor } from "../utils/colorDetection";
// If your types file is actually 'types.ts' in the same folder, use:
import { Player, Weapon } from "../../server/types";
// Or update the path/filename as needed to match your project structure.

const LoginScreen: React.FC = () => {
  const { setPlayer, setCurrentView } = useGame();
  const [playerName, setPlayerName] = useState("");
  const [detectedColor, setDetectedColor] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => { startCamera(); }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { setError("Camera access denied. Please allow camera permissions."); }
  };

  const handleScan = async () => {
    if (!videoRef.current) return;
    setScanning(true); setError("");
    try { setDetectedColor(await getDominantColor(videoRef.current)); } 
    catch { setError("Failed to detect color. Ensure good lighting and try again."); } 
    finally { setScanning(false); }
  };

  const handleRescan = () => { setDetectedColor(null); setError(""); };

  const handleConfirm = () => {
    if (!playerName || !detectedColor) return;
    const newPlayer: Player = { id: Date.now(), name: playerName, color: detectedColor, score: 0, points: 0,
      weapons: ["pistol"] as Weapon[], currentWeapon: "pistol", ammo: 6, lives: 3 };
    setPlayer(newPlayer); setCurrentView("lobby");
  };

  const cyberpunkText = (color: string, size: string, shadow: string) => ({ color, fontSize: size, textShadow: shadow });
  const cyberpunkButton = (gradient: string, textColor: string, disabled = false) => ({
    padding: '20px', border: 'none', borderRadius: '15px', background: gradient, color: textColor,
    fontSize: '1.1rem', fontWeight: '600', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1
  });

  return (
    <div style={{ maxWidth: "500px", margin: "20px", padding: "40px", background: "rgba(0, 0, 0, 0.8)", 
                  borderRadius: "20px", border: "2px solid rgba(0, 255, 255, 0.3)", backdropFilter: "blur(10px)" }}>
      
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={cyberpunkText('#00ffff', '3rem', '0 0 30px rgba(0, 255, 255, 0.5)')}>⚡ NEON LASER ARENA</h1>
        <p style={cyberpunkText('rgba(0, 255, 255, 0.8)', '1.1rem', '0 0 10px rgba(0, 255, 255, 0.5)')}>
          SCAN YOUR IDENTITY TO ENTER THE BATTLE ZONE
        </p>
      </div>

      <div style={{ marginBottom: "25px" }}>
        <input type="text" placeholder="ENTER CODENAME" value={playerName} onChange={(e) => setPlayerName(e.target.value)}
               style={{ width: "100%", padding: "20px", border: "2px solid rgba(0, 255, 255, 0.3)", borderRadius: "15px",
                       background: "rgba(0, 0, 0, 0.6)", color: "#00ffff", fontSize: "1.1rem", textAlign: "center" }} />
      </div>

      <div style={{ marginBottom: "25px" }}>
        <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "250px", borderRadius: "15px",
                background: "rgba(0, 0, 0, 0.6)", border: "3px solid rgba(0, 255, 255, 0.3)", objectFit: "cover" }} />
        
        {detectedColor && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "15px", marginTop: "15px",
                        padding: "15px", background: "rgba(0, 0, 0, 0.7)", border: "2px solid rgba(255, 0, 128, 0.3)",
                        borderRadius: "15px", animation: "neonPulse 2s infinite alternate" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "8px", border: "2px solid #00ffff", 
                          backgroundColor: detectedColor }} />
            <span style={{ color: "#00ffff" }}>COLOR CAPTURED</span>
            <button onClick={handleRescan} style={{ padding: "8px 12px", background: "rgba(255, 0, 128, 0.3)",
                        border: "1px solid #ff0080", borderRadius: "5px", color: "#ff0080", cursor: "pointer" }}>
              RESCAN
            </button>
          </div>
        )}
      </div>

      {error && <div style={{ color: "#ff6b6b", background: "rgba(255, 107, 107, 0.1)", padding: "15px", borderRadius: "10px",
                              margin: "15px 0", borderLeft: "4px solid #ff6b6b" }}>⚠️ {error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {!detectedColor ? (
          <button onClick={handleScan} disabled={scanning} style={cyberpunkButton('linear-gradient(45deg, #ff0080, #ff00ff)', 'white', scanning)}>
            {scanning ? "🔄 SCANNING..." : "🎨 SCAN COLOR SIGNATURE"}
          </button>
        ) : (
          <button onClick={handleConfirm} disabled={!playerName} style={cyberpunkButton('linear-gradient(45deg, #00ffff, #00ff88)', 'black', !playerName)}>
            ⚡ INITIATE COMBAT SEQUENCE
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;