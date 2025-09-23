"use client";
import React, { useEffect, useState, useRef } from "react";
import { useGame } from "../context/GameContext";
import WeaponSelector from "./WeaponSelector";
import MiniMap from "./MiniMap";

const GameScreen: React.FC = () => {
  const { player, gameState, shoot, reloadWeapon, setCurrentView, switchWeapon, purchaseItem } = useGame();
  const [gameTimer, setGameTimer] = useState(300);
  const [showStore, setShowStore] = useState(false);
  const [detectedColor, setDetectedColor] = useState<string | null>(null);
  const [cameraAvailable, setCameraAvailable] = useState(false);

  const shootSound = useRef<HTMLAudioElement | null>(null);
  const reloadSound = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Audio init
  useEffect(() => {
    if (typeof window !== "undefined") {
      shootSound.current = new Audio("/sounds/shoot.wav");
      reloadSound.current = new Audio("/sounds/reload.wav");
    }
  }, []);

  // Game timer and camera init
  useEffect(() => {
    if (!gameState || !player) return;

    // Timer
    const timer = setInterval(() => {
      setGameTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Camera: use front camera for laptop/testing ("user")
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }, // front camera
          audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // attempt to play; some browsers require user gesture
          videoRef.current.play().catch(() => {});
          setCameraAvailable(true);

          // wait until video metadata is loaded then start scanning
          const onMeta = () => {
            startColorScanning();
            videoRef.current?.removeEventListener("loadedmetadata", onMeta);
          };
          if (videoRef.current.readyState >= 2) {
            startColorScanning();
          } else {
            videoRef.current.addEventListener("loadedmetadata", onMeta);
          }
        }
      } catch (err) {
        console.error("Camera access denied or not available:", err);
        setCameraAvailable(false);
      }
    };

    startCamera();

    return () => {
      clearInterval(timer);
      stopScanning();
      // stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
    // only run when a new game starts
  }, [gameState, player]);

  // startColorScanning sets up an interval that reads the center area of the video
  const startColorScanning = () => {
    stopScanning(); // ensure only one interval runs

    const scanFn = () => {
      if (!videoRef.current || !canvasRef.current || !gameState || !player) {
        setDetectedColor(null);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;

      // Use smaller scan area for better performance
      const scanSize = Math.floor(Math.min(vw, vh) * 0.18); // ~18% of smaller dimension
      const cx = Math.floor(vw / 2 - scanSize / 2);
      const cy = Math.floor(vh / 2 - scanSize / 2);

      canvas.width = vw;
      canvas.height = vh;

      try {
        ctx.drawImage(video, 0, 0, vw, vh);
        const imageData = ctx.getImageData(cx, cy, scanSize, scanSize);
        const pixels = imageData.data;

        const colorCount: Record<string, number> = {};
        // only consider alive enemy colors
        const enemyColors = gameState.lobby.players
          .filter(p => p.id !== player.id && p.lives > 0)
          .map(p => p.color);

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];

          const color = getDominantColor(r, g, b);
          if (color && enemyColors.includes(color)) {
            colorCount[color] = (colorCount[color] || 0) + 1;
          }
        }

        // pick the most frequent detected enemy color
        const sorted = Object.entries(colorCount).sort((a, b) => b[1] - a[1]);
        if (sorted.length === 0) {
          setDetectedColor(null);
          return;
        }

        const [topColor, topCount] = sorted[0];
        // threshold: require a reasonable number of pixels to avoid noise
        const threshold = Math.max(30, Math.floor((scanSize * scanSize) * 0.06)); // at least 6% of area or 30 px
        if (topCount >= threshold) {
          setDetectedColor(topColor);
        } else {
          setDetectedColor(null);
        }
      } catch (err) {
        // getImageData can throw if canvas tainted or other errors
        console.warn("scanColors error:", err);
        setDetectedColor(null);
      }
    };

    // run scan every 300ms
    const id = window.setInterval(scanFn, 300);
    scanIntervalRef.current = id;
  };

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setDetectedColor(null);
  };

  // Map RGB to color labels used by players
  const getDominantColor = (r: number, g: number, b: number): string | null => {
    // tuned thresholds to be tolerant; adjust if needed
    if (r > 150 && g < 110 && b < 110) return "red";
    if (r < 110 && g < 110 && b > 150) return "blue";
    if (r < 110 && g > 150 && b < 110) return "green";
    if (r > 200 && g > 200 && b < 120) return "yellow";
    if (r > 140 && g < 120 && b > 140) return "purple";
    if (r > 200 && g > 120 && b < 120) return "orange";
    return null;
  };

  if (!player || !gameState) return <div style={styles.centerScreen}>LOADING GAME...</div>;

  const currentPlayer = gameState.lobby.players.find(p => p.id === player.id);
  if (!currentPlayer) return <div style={styles.centerScreen}>PLAYER NOT FOUND</div>;

  const isGameActive = gameState.lobby.state === "active";
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // Shoot only when there is a real detected color (no dummy)
  const handleShoot = () => {
    if (!isGameActive) {
      console.log("Game not active");
      return;
    }
    if (currentPlayer.ammo <= 0) {
      console.log("No ammo");
      return;
    }
    if (currentPlayer.isReloading) {
      console.log("Currently reloading");
      return;
    }
    if (!detectedColor) {
      console.log("No valid target detected — cannot shoot (no dummy targets).");
      // Optionally play a "click" or "empty" sound — not implemented here
      return;
    }

    // Play shoot sound
    if (shootSound.current) {
      shootSound.current.currentTime = 0;
      shootSound.current.play().catch(e => console.warn("Audio play failed:", e));
    }

    // Call server with the real detected color
    console.log(`Shooting detected color: ${detectedColor}`);
    shoot(detectedColor);
  };

  const handleReload = () => {
    if (!isGameActive) return;
    if (reloadSound.current) {
      reloadSound.current.currentTime = 0;
      reloadSound.current.play().catch(e => console.warn("Audio play failed:", e));
    }
    reloadWeapon();
  };

  const handleWeapon = (weapon: string) => {
    const owned = currentPlayer.weapons.find(w => w.name === weapon);
    if (owned) {
      switchWeapon(weapon);
    } else {
      const weaponMap: { [k: string]: any } = {
        pistol: { name: "pistol", damage: 10, ammoCapacity: 12, reloadTime: 2, fireRate: 1, cost: 0 },
        shotgun: { name: "shotgun", damage: 25, ammoCapacity: 6, reloadTime: 3, fireRate: 0.5, cost: 100 },
        rifle: { name: "rifle", damage: 15, ammoCapacity: 30, reloadTime: 2.5, fireRate: 2, cost: 200 }
      };
      const weaponData = weaponMap[weapon];
      if (currentPlayer.score >= weaponData.cost) {
        purchaseItem("weapon", weaponData);
      } else {
        console.log("Not enough points to buy", weapon);
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* Hidden canvas used for scanning */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Top Stats Panel */}
      <div style={styles.topStats}>
        <div style={styles.statItem}>⏱️ {formatTime(gameTimer)}</div>
        <div style={styles.statItem}>❤️ {currentPlayer.lives}</div>
        <div style={styles.statItem}>💰 {currentPlayer.score}</div>
        <div style={styles.statItem}>🔫 {currentPlayer.ammo}/{currentPlayer.currentWeapon.ammoCapacity}</div>

        <button style={styles.iconButton} onClick={() => setShowStore(true)}>🛒</button>
        <button style={styles.iconButton} onClick={() => confirm("Return to lobby?") && setCurrentView("lobby")}>🚪</button>
      </div>

      {/* Detected color pill — only shown if a real enemy color is detected */}
      {detectedColor && (
        <div style={styles.colorIndicator}>
          <div style={{ ...styles.detectedColor, backgroundColor: detectedColor }}>
            TARGET: {detectedColor.toUpperCase()}
          </div>
        </div>
      )}

      {/* Radar */}
      {isGameActive && <div style={styles.radarContainer}><MiniMap /></div>}

      {/* Camera */}
      <div style={styles.cameraContainer}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={styles.camera}
        />
        {/* Crosshair: classic small + */}
        <div style={styles.crosshair}>
          <div style={styles.crosshairVertical} />
          <div style={styles.crosshairHorizontal} />
        </div>
      </div>

      {/* Controls */}
      {isGameActive && (
        <div style={styles.controls}>
          <button
            style={{ ...styles.actionButton, ...styles.reloadButton }}
            onClick={handleReload}
            disabled={currentPlayer.isReloading}
          >
            {currentPlayer.isReloading ? "⏳" : "🔄"}
          </button>

          <div style={styles.weapons}>
            {["pistol", "shotgun", "rifle"].map(weapon => {
              const isEquipped = currentPlayer.currentWeapon.name === weapon;
              const isOwned = currentPlayer.weapons.find(w => w.name === weapon);
              const weaponCost = { pistol: 0, shotgun: 100, rifle: 200 }[weapon];

              return (
                <button
                  key={weapon}
                  style={{
                    ...styles.weaponBtn,
                    border: isEquipped ? "3px solid #00ffff" : "1px solid #fff",
                    opacity: isOwned ? 1 : 0.6
                  }}
                  onClick={() => handleWeapon(weapon)}
                  title={isOwned ? `Equip ${weapon}` : `Buy ${weapon} - ${weaponCost} points`}
                >
                  {{ pistol: "🔫", shotgun: "💥", rifle: "🏹" }[weapon]}
                </button>
              );
            })}
          </div>

          <button
            style={{
              ...styles.actionButton,
              ...styles.shootButton,
              opacity: (currentPlayer.ammo <= 0 || currentPlayer.isReloading || !detectedColor) ? 0.6 : 1
            }}
            onClick={handleShoot}
            disabled={currentPlayer.ammo <= 0 || currentPlayer.isReloading || !detectedColor}
            title={detectedColor ? `Shoot ${detectedColor} enemy!` : "No detected target"}
          >
            🔥 SHOOT
          </button>
        </div>
      )}

      {/* Store */}
      {showStore && (
        <div style={styles.popupOverlay}>
          <div style={styles.popup}>
            <div style={styles.popupHeader}>
              <h3>🛒 STORE - Points: {currentPlayer.score}</h3>
              <button style={styles.closeButton} onClick={() => setShowStore(false)}>✕</button>
            </div>
            <WeaponSelector />
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { width: "100vw", height: "100vh", background: "#000", position: "relative" as const, overflow: "hidden" },
  centerScreen: { width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#00ffff", fontSize: "2rem", background: "#000" },

  topStats: {
    position: "absolute" as const,
    top: "15px",
    left: "15px",
    right: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2000,
    background: "rgba(0,0,0,0.8)",
    padding: "12px",
    borderRadius: "15px",
    border: "2px solid #ff0080"
  },
  statItem: { color: "#fff", fontSize: "1.3rem", fontWeight: "bold" as const, textShadow: "0 0 10px currentColor" },
  iconButton: { background: "linear-gradient(45deg, #ff0080, #ff00ff)", border: "none", borderRadius: "50%", width: "50px", height: "50px", fontSize: "1.5rem", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },

  colorIndicator: {
    position: "absolute" as const,
    top: "90px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1500
  },
  detectedColor: {
    background: "rgba(0,0,0,0.7)",
    color: "white",
    padding: "8px 16px",
    borderRadius: "10px",
    border: "2px solid rgba(255,255,255,0.12)",
    fontWeight: "bold",
    fontSize: "1rem"
  },

  radarContainer: { position: "absolute" as const, top: "140px", left: "20px", zIndex: 1000 },

  cameraContainer: { width: "100%", height: "100%", position: "relative" as const },
  camera: { width: "100%", height: "100%", objectFit: "cover" as const, filter: "contrast(1.05)" },

  crosshair: { position: "absolute" as const, top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "20px", height: "20px", pointerEvents: "none", zIndex: 1200 },
  crosshairVertical: { position: "absolute" as const, top: 0, left: "50%", width: "2px", height: "100%", background: "#ff0080", transform: "translateX(-50%)" },
  crosshairHorizontal: { position: "absolute" as const, top: "50%", left: 0, width: "100%", height: "2px", background: "#ff0080", transform: "translateY(-50%)" },

  controls: { position: "absolute" as const, bottom: "25px", left: "20px", right: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1000 },
  actionButton: { width: "80px", height: "80px", borderRadius: "50%", border: "none", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" },
  shootButton: { background: "linear-gradient(45deg, #ff0080, #c44569)", color: "white", width: "120px" },
  reloadButton: { background: "linear-gradient(45deg, #00ffff, #00ff88)", color: "black" },
  weapons: { display: "flex", gap: "10px", background: "rgba(0,0,0,0.7)", padding: "10px", borderRadius: "15px" },
  weaponBtn: { width: "60px", height: "60px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", color: "white", fontSize: "1.8rem", border: "1px solid #fff", cursor: "pointer" },

  popupOverlay: { position: "fixed" as const, top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 },
  popup: { background: "#000", padding: "20px", borderRadius: "15px", border: "3px solid #ff0080", maxWidth: "90%", maxHeight: "80%", overflow: "auto" },
  popupHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", color: "#ff0080", fontSize: "1.3rem" },
  closeButton: { background: "#ff6b6b", border: "none", borderRadius: "5px", color: "white", padding: "8px 12px", cursor: "pointer" }
};

export default GameScreen;
