// Student Number: 2023094242
// Student Number: 2019042973

import React, { useState, useEffect, useRef } from 'react'; // Standard React hooks for component state, side effects, and persistent values.
import { useLocation, useNavigate } from 'react-router-dom'; // Hooks for accessing location state (passed data) and programmatic navigation.
import WeaponBar from '../components/WeaponBar.jsx';
import ShopPanel from '../components/ShopPanel.jsx';
import RadarMap from '../components/RadarMap.jsx';

export default function BattleArena() {
  const navigate = useNavigate();
  const [activeGun, setActiveGun] = useState('pistol');
  const [shopOpen, setShopOpen] = useState(false);
  const [gameData, setGameData] = useState({});
  const [playerData, setPlayerData] = useState({});
  const [ammo, setAmmo] = useState(5);
  const [lives, setLives] = useState(3);
  const [health, setHealth] = useState(100);
  const [isReloading, setIsReloading] = useState(false);
  const [points, setPoints] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isEliminated, setIsEliminated] = useState(false);
  const [activePowerups, setActivePowerups] = useState({});
  const [gpsStatus, setGpsStatus] = useState('loading'); // State to track the status of the device's GPS (Global Positioning System).

  const location = useLocation();
  const { playerTag, arenaCode, Color } = location.state || {}; // Destructure required game state passed from the previous route.

  const socketRef = useRef(null); // useRef for a mutable WebSocket connection object that won't cause re-renders on change.
  const videoRef = useRef(null); // useRef to attach to the <video> element for accessing the camera stream.
  const shootSoundRef = useRef(null);
  const reloadSoundRef = useRef(null);
  const gpsWatchId = useRef(null); // Stores the ID returned by navigator.geolocation.watchPosition for cleanup.

  const weaponConfig = { // Configuration object defining weapon stats and costs.
    pistol: { name: "Pistol", damage: 25, cost: 0, ammo: 5, icon: "pistol.png" },
    rifle: { name: "Rifle", damage: 35, cost: 100, ammo: 10, icon: "rifle.png" },
    shotgun: { name: "Shotgun", damage: 50, cost: 200, ammo: 6, icon: "shotgun.png" }
  };

  // GPS positioning function
  const startGpsTracking = () => {
    if (!navigator.geolocation) { // Check if the browser supports the Geolocation API.
      setGpsStatus('unavailable');
      sendGpsStatus(false);
      return;
    }

    setGpsStatus('loading');

    // Request high accuracy for better positioning
    const options = {
      enableHighAccuracy: true, // Request the best possible location (uses more power/time).
      timeout: 10000,
      maximumAge: 30000
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsStatus('active');
        sendGpsPosition(position);
        
        // Start watching position
        gpsWatchId.current = navigator.geolocation.watchPosition( // Start continuously monitoring the device's position.
          (position) => {
            sendGpsPosition(position); // Callback function that runs whenever the device's position changes.
          },
          (error) => {
            handleGpsError(error);
          },
          options
        );
      },
      (error) => {
        handleGpsError(error);
      },
      options
    );
  };


  const handleGpsError = (error) => {
  console.warn('GPS Error:', error);
  setGpsStatus('unavailable'); 
  sendGpsStatus(false);
};

  // Send GPS position to server
  const sendGpsPosition = (position) => {
    if (socketRef.current?.readyState === 1) { // Check if the WebSocket is open (ready state 1).
      socketRef.current.send(JSON.stringify({
        action: 'gpsUpdate', // Action type to identify the message on the server.
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      }));
    }
  };

  // Send GPS status to server
  const sendGpsStatus = (available) => {
    if (socketRef.current?.readyState === 1) {
      socketRef.current.send(JSON.stringify({
        action: 'gpsUpdate',
        gpsAvailable: available // Let the server know if GPS data is available or not.
      }));
    }
  };

  // Stop GPS tracking
  const stopGpsTracking = () => {
    if (gpsWatchId.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchId.current); // Use clearWatch to stop the continuous GPS monitoring.
      gpsWatchId.current = null;
    }
  };

  // Load sounds
  useEffect(() => {
    shootSoundRef.current = new Audio('/sounds/shoot.wav'); // Initialize the shoot sound object.
    reloadSoundRef.current = new Audio('/sounds/reload.wav');
    
    shootSoundRef.current.load();
    reloadSoundRef.current.load();
  }, []);

  const connectToBattle = () => {
    if (!arenaCode || !playerTag) {
      setConnectionError('Missing game data');
      setIsConnecting(false);
      return;
    }

    setIsConnecting(true);
    setConnectionError('');

    if (socketRef.current) socketRef.current.close();

    try {
     const backendUrl = import.meta.env.VITE_BACKEND_URL || 'laser-tag-treasure-hunt-1-xzbg.onrender.com';
const wsUrl = `wss://${backendUrl}/ws/${arenaCode}/game?player=${encodeURIComponent(playerTag)}&color=${encodeURIComponent((Color || 'red').replace('#',''))}`;
const ws = new WebSocket(wsUrl);
socketRef.current = ws;
      ws.onopen = () => {
        setIsConnecting(false);
        ws.send(JSON.stringify({ action: 'join', player: playerTag, color: Color, weapon: activeGun }));
        
        // Start GPS tracking after connection
        setTimeout(() => {
          startGpsTracking(); // Initiate GPS tracking shortly after a successful WebSocket connection.
        }, 1000);
      };

      ws.onmessage = (event) => { // Handles incoming messages from the WebSocket server.
        try {
          const data = JSON.parse(event.data);
          console.log('Received message type:', data.type);

          if (data.type === 'arenaUpdate') { // Primary update message containing all current game state and player stats.
            setGameData(data.gameState || {});
            setTimeLeft(data.gameState?.timeRemaining || 300);
            
            const currentPlayerStats = data.playerStats?.find(p => p.tag === playerTag); // Finds the current player's stats within the array.
            if (currentPlayerStats) {
              setPlayerData(currentPlayerStats);
              setAmmo(currentPlayerStats.ammo); // Update client-side state with the authoritative server data.
              setLives(currentPlayerStats.lives);
              setHealth(currentPlayerStats.health);
              setPoints(currentPlayerStats.points);
              setIsEliminated(currentPlayerStats.isEliminated || false);
              setActivePowerups(currentPlayerStats.activePowerups || {});
              
              if (!currentPlayerStats.weapons.includes(activeGun)) {
                setActiveGun('pistol'); // Force switch to pistol if the current gun is no longer owned.
              }
            }

          } else if (data.type === 'hitConfirmed') {
            setPoints(data.points);
            if (shootSoundRef.current) {
              shootSoundRef.current.currentTime = 0;
              shootSoundRef.current.play().catch(() => {});
            }
            
          } else if (data.type === 'playerHit') {
            setHealth(data.healthRemaining);
            setLives(data.livesRemaining);
            
            if (data.healthRemaining <= 0 && data.livesRemaining <= 0) {
              setIsEliminated(true); // Player is fully eliminated from the battle.
            }
            
          } else if (data.type === 'playerLifeLost') {
            setHealth(100); // Reset health after losing a life.
            setLives(data.livesRemaining);
            
          } else if (data.type === 'gameEnd') {
            console.log('Game ending, navigating to scores...');
            stopGpsTracking(); // Crucial step to stop continuous GPS use when the game finishes.
            navigate('/scores', { 
              state: { 
                arenaCode, 
                playerTag,
                results: data.results,
                winner: data.winner,
                winCondition: data.winCondition
              } 
            });
            
          } else if (data.type === 'purchaseSuccess') {
            setPoints(data.points);
            setShopOpen(false);
            
          } else if (data.type === 'reloadComplete') {
            setAmmo(data.ammo);
            setIsReloading(false);
          }
        } catch (err) {
          console.error('Message parse error:', err);
        }
      };

      ws.onerror = () => {
        setConnectionError('Connection failed. Check server.');
        setIsConnecting(false);
        stopGpsTracking(); // Stop GPS on a connection error.
      };

      ws.onclose = (event) => {
        setIsConnecting(false);
        stopGpsTracking(); // Stop GPS when the WebSocket closes (disconnects).
        if (event.code !== 1000) {
          setConnectionError('Connection lost. Reconnecting...');
          setTimeout(() => {
            if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
              connectToBattle(); // Attempt to reconnect after a delay.
            }
          }, 3000);
        }
      };

    } catch (err) {
      setConnectionError('Failed to create connection');
      setIsConnecting(false);
      stopGpsTracking(); // Stop GPS on connection creation failure.
    }
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } // Request camera access with preferred resolution.
      });
      if (videoRef.current) videoRef.current.srcObject = stream; // Attach the video stream to the <video> element.
    } catch (err) {
      console.warn('Camera unavailable', err);
    }
  };

  useEffect(() => {
    connectToBattle();
    startCamera();

    document.body.style.overflow = 'hidden';
    return () => { // Cleanup function runs when the component unmounts.
      document.body.style.overflow = 'unset';
      stopGpsTracking(); // NEW: Crucial to stop location tracking when leaving to save resources/battery.
      if (socketRef.current) socketRef.current.close(); // Close the WebSocket connection.
      if (videoRef.current?.srcObject)
        videoRef.current.srcObject.getTracks().forEach(track => track.stop()); // Stop the camera stream.
    };
  }, [arenaCode, playerTag, Color]); // Dependency array ensures effects run only on mount and when these props change.

  const fireWeapon = () => {
    if (isReloading || ammo <= 0 || isEliminated) return; // Prevent firing if reloading, out of ammo, or eliminated.
    
    setAmmo(prev => prev - 1);

    if (shootSoundRef.current) {
      shootSoundRef.current.currentTime = 0;
      shootSoundRef.current.play().catch(() => {});
    }

    if (socketRef.current?.readyState === 1) {
      const canvas = document.createElement('canvas'); // Create a temporary canvas element.
      const ctx = canvas.getContext('2d');
      const video = videoRef.current;
      
      if (!video || !video.videoWidth) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0); // Draw the current video frame onto the canvas.

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      const pixel = ctx.getImageData(centerX, centerY, 1, 1).data; // Get the color data for the single pixel in the center (the crosshair).
      const hexColor = rgbToHex(pixel[0], pixel[1], pixel[2]);
      const simpleColor = hexToSimpleColor(hexColor); // Convert the pixel color to a predefined simple color name (e.g., 'red', 'blue').

      socketRef.current.send(JSON.stringify({ 
        action: 'fire', 
        weapon: activeGun, 
        targetColor: simpleColor, // Send the recognized target color to the server for hit detection.
      }));
    }
  };

  const reloadWeapon = () => {
    const maxAmmo = weaponConfig[activeGun]?.ammo || 5;
    if (isReloading || ammo === maxAmmo || isEliminated) return;
    
    setIsReloading(true); // Set state to block actions during reload.
    
    if (reloadSoundRef.current) {
      reloadSoundRef.current.currentTime = 0;
      reloadSoundRef.current.play().catch(() => {});
    }

    if (socketRef.current?.readyState === 1) {
      socketRef.current.send(JSON.stringify({ action: 'reload', weapon: activeGun })); // Notify the server to start the reload action.
    }
    
    setTimeout(() => {
      setAmmo(maxAmmo); // Client-side update for immediate feedback (though server message overrides this eventually).
      setIsReloading(false);
    }, 2000);
  };

  const buyItem = (itemType) => {
    const item = weaponConfig[itemType];
    const cost = item ? item.cost : (itemType === 'healthPack' ? 80 : 150);
    
    if (points >= cost) {
      if (socketRef.current?.readyState === 1) {
        socketRef.current.send(JSON.stringify({ action: 'purchase', item: itemType })); // Send a purchase request to the server.
      }
    }
  };

  const switchWeapon = (weapon) => {
    const availableWeapons = playerData.weapons || ['pistol'];
    if (availableWeapons.includes(weapon) && !isEliminated) {
      setActiveGun(weapon);
      setAmmo(weaponConfig[weapon].ammo);
    }
  };

  const confirmLeave = () => setShowLeaveConfirm(true);
  const cancelLeave = () => setShowLeaveConfirm(false);

  const leaveGame = () => {
    stopGpsTracking(); // NEW: Stop GPS tracking immediately upon leaving the game.
    if (socketRef.current?.readyState === 1) {
      socketRef.current.send(JSON.stringify({ action: 'leave' }));
      socketRef.current.close();
    }
    navigate('/'); // Navigate back to the home screen.
  };

  const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  
  const hexToSimpleColor = (hex) => { // Core logic to map the camera's central pixel color to one of the game's simple target colors.
    const hexColor = hex.replace('#', '');
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);

    const colorMap = [
      { name: 'red', values: [255, 0, 0] },
      { name: 'blue', values: [0, 0, 255] },
      { name: 'green', values: [0, 255, 0] },
      { name: 'yellow', values: [255, 255, 0] },
      { name: 'purple', values: [128, 0, 128] },
      { name: 'orange', values: [255, 165, 0] }
    ];

    let closestColor = 'red';
    let minDistance = Infinity;

    colorMap.forEach(({ name, values: [cr, cg, cb] }) => {
      const distance = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2); // Calculate Euclidean distance in RGB space to find the closest match.
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = name;
      }
    });

    return closestColor;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // GPS Status Indicator
  const renderGpsStatus = () => { // Component function to display the current GPS status visually on the screen.
  if (gpsStatus === 'active') {
    return (
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.8)',
        padding: '8px 12px',
        borderRadius: '5px',
        border: `2px solid #00ff00`,
        color: '#00ff00',
        fontWeight: 'bold',
        fontSize: '12px',
        zIndex: 60
      }}>
        📍 GPS ACTIVE
      </div>
    );
  } else {
    return (
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.8)',
        padding: '8px 12px',
        borderRadius: '5px',
        border: `2px solid #ff4444`,
        color: '#ff4444',
        fontWeight: 'bold',
        fontSize: '12px',
        zIndex: 60
      }}>
        ❌ GPS UNAVAILABLE
      </div>
    );
  }
};

  const renderHealthBar = () => {
    const percentage = (health / 100) * 100;
    return (
      <div style={{ 
        width: '200px', 
        background: '#333', 
        borderRadius: '10px', 
        overflow: 'hidden',
        border: '2px solid #444'
      }}>
        <div style={{ 
          width: `${percentage}%`, 
          height: '20px', 
          background: percentage > 50 ? '#00ff00' : percentage > 25 ? '#ffaa00' : '#ff4444',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#000'
        }}>
          {health}/100
        </div>
      </div>
    );
  };

  const renderLives = () => {
    return (
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        {[...Array(3)].map((_, index) => (
          <span key={index} style={{ 
            fontSize: '24px', 
            color: index < lives ? '#ff4444' : '#ffffff', // Changes heart color based on remaining lives.
            opacity: index < lives ? 1 : 0.3,
            filter: index < lives ? 'drop-shadow(0 0 5px #ff4444)' : 'none',
            transition: 'all 0.3s ease'
          }}>
            ❤️
          </span>
        ))}
      </div>
    );
  };

  const renderPowerupIndicator = () => {
    if (Object.keys(activePowerups).length === 0) return null;
    
    return (
      <div style={{
        position: 'absolute',
        top: '60px', // Moved down to avoid GPS status
        left: '20px',
        background: 'rgba(255, 215, 0, 0.9)',
        padding: '10px 15px',
        borderRadius: '10px',
        border: '2px solid #FFD700',
        color: '#000',
        fontWeight: 'bold',
        fontSize: '14px',
        zIndex: 60
      }}>
        ⚡ POWERUP ACTIVE: {Object.keys(activePowerups)[0]}
      </div>
    );
  };

  if (!playerTag || !arenaCode) {
    return <div style={{ background:'#0a0a0a', color:'white', minHeight:'100vh', display:'flex', justifyContent:'center', alignItems:'center' }}>
      <h1>❌ Missing Game Data</h1>
    </div>;
  }

  if (isConnecting) {
    return <div style={{ background:'#0a0a0a', color:'white', minHeight:'100vh', display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
      <h1>🔄 Connecting to Battle...</h1>
      {connectionError && <p style={{color:'#ff6b6b'}}>{connectionError}</p>}
      <button onClick={connectToBattle}>Retry Connection</button>
    </div>;
  }

  const combatants = gameData.combatants || [];
  const currentWeapon = weaponConfig[activeGun];
  const unlockedWeapons = playerData.weapons || ['pistol'];

  return (
    <div style={{ 
      background:'#0a0a0a', 
      height: '100vh',
      color:'white', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      
      {/* Header with Timer and Status */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '15px 20px', 
        borderBottom: '2px solid #00f3ff',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        boxShadow: '0 2px 20px rgba(0, 243, 255, 0.3)',
        flexShrink: 0
      }}>
        
        {/* Timer */}
        <div style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: timeLeft < 60 ? '#ff4444' : '#00f3ff',
          background: 'rgba(0,0,0,0.7)',
          padding: '10px 20px',
          borderRadius: '15px',
          border: '3px solid #00f3ff',
          textShadow: '0 0 10px currentColor',
          minWidth: '140px',
          textAlign: 'center'
        }}>
          ⏱️ {formatTime(timeLeft)}
        </div>
        
        {/* Player Stats */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '30px',
          background: 'rgba(0,0,0,0.5)',
          padding: '10px 20px',
          borderRadius: '15px',
          border: '2px solid #00f3ff'
        }}>
          
          {/* Lives */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: '#00f3ff', marginBottom: '5px' }}>LIVES</div>
            {renderLives()}
          </div>
          
          {/* Health */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: '#00f3ff', marginBottom: '5px' }}>HEALTH</div>
            {renderHealthBar()}
          </div>
          
          {/* Ammo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: '#00f3ff', marginBottom: '5px' }}>AMMO</div>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              color: ammo > 2 ? '#00f3ff' : ammo > 0 ? '#ffaa00' : '#ff4444'
            }}>
              {ammo}/{currentWeapon.ammo}
            </div>
          </div>
          
          {/* Points */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: '#00f3ff', marginBottom: '5px' }}>POINTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00f3ff' }}>
              {points}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShopOpen(true)} style={{ 
            background: 'linear-gradient(45deg, #00f3ff, #0099cc)', 
            color: '#000', 
            border: 'none', 
            padding: '12px 20px', 
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 0 15px rgba(0, 243, 255, 0.5)'
          }}>
            🛒 STORE
          </button>
          <button onClick={confirmLeave} style={{ 
            background: 'linear-gradient(45deg, #ff4444, #cc0000)', 
            color: 'white', 
            border: 'none', 
            padding: '12px 20px', 
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 0 15px rgba(255, 68, 68, 0.5)'
          }}>
            🚪 LEAVE
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div style={{ 
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 0
      }}>
        
        {/* Full Screen Camera */}
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            background: '#222' 
          }} 
        />
        
        {/* GPS Status Indicator */}
        {renderGpsStatus()}
        
        {/* Powerup Indicator */}
        {renderPowerupIndicator()}
        
        {/* Eliminated Overlay */}
        {isEliminated && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 50
          }}>
            <div style={{
              textAlign: 'center',
              background: 'rgba(255,0,0,0.3)',
              padding: '40px',
              borderRadius: '20px',
              border: '5px solid #ff4444'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💀</div>
              <h1 style={{ color: '#ff4444', fontSize: '3rem', marginBottom: '10px' }}>ELIMINATED</h1>
              <p style={{ fontSize: '1.2rem' }}>Waiting for game to end...</p>
              <p style={{ fontSize: '1rem', opacity: 0.7 }}>You earned {points} points</p>
            </div>
          </div>
        )}
        
        {/* Minimap Overlay */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 40
        }}>
          <RadarMap 
            players={combatants} 
            currentPlayer={playerTag} 
            gpsBounds={gameData.gpsBounds} // Pass GPS boundary data for map rendering/scaling.
          />
        </div>

        {/* Crosshair */}
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          fontSize: '40px', 
          color: isEliminated ? '#666' : '#00f3ff',
          textShadow: '0 0 10px currentColor',
          opacity: 0.8,
          zIndex: 30
        }}>
          ✜
        </div>
      </div>

      {/* Bottom Controls with Image Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px', 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderTop: '2px solid #00f3ff',
        gap: '20px',
        boxShadow: '0 -2px 20px rgba(0, 243, 255, 0.3)',
        flexShrink: 0,
        height: '120px'
      }}>
        
        {/* Shoot Button - Left */}
        <button 
          onClick={fireWeapon} 
          disabled={isReloading || ammo <= 0 || isEliminated}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: isEliminated || (ammo <= 0 && !isReloading) ? 'not-allowed' : 'pointer',
            opacity: isReloading ? 0.7 : 1,
            transition: 'all 0.3s ease',
            padding: '0',
            filter: isEliminated || ammo <= 0 ? 'grayscale(100%) brightness(0.5)' : 'none'
          }}
          title={isEliminated ? 'Eliminated' : ammo <= 0 ? 'No Ammo' : 'Shoot'}
        >
          <img 
            src="/images/shoot.png" 
            alt="Shoot"
            style={{
              width: '80px',
              height: '80px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!isEliminated && ammo > 0 && !isReloading) {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.filter = 'drop-shadow(0 0 10px #ff4444)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.filter = 'none';
            }}
          />
        </button>
        
        {/* Weapon Selection - Center */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', height: '100%' }}>
          <WeaponBar 
            weapons={weaponConfig} 
            currentWeapon={activeGun} 
            onWeaponSelect={switchWeapon} 
            unlockedWeapons={unlockedWeapons}
            disabled={isEliminated}
          />
        </div>
        
        {/* Reload Button - Right */}
        <button 
          onClick={reloadWeapon} 
          disabled={isReloading || ammo === currentWeapon.ammo || isEliminated}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: isEliminated || isReloading ? 'not-allowed' : 'pointer',
            opacity: isReloading ? 0.7 : 1,
            transition: 'all 0.3s ease',
            padding: '0',
            filter: isEliminated || isReloading ? 'grayscale(100%) brightness(0.5)' : 'none'
          }}
          title={isEliminated ? 'Eliminated' : isReloading ? 'Reloading...' : 'Reload'}
        >
          <img 
            src="/images/reload.png" 
            alt="Reload"
            style={{
              width: '80px',
              height: '80px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!isEliminated && !isReloading && ammo !== currentWeapon.ammo) {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.filter = 'drop-shadow(0 0 10px #00f3ff)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.filter = 'none';
            }}
          />
        </button>
      </div>

      {/* Status Text below buttons */}
      <div style={{
        textAlign: 'center',
        padding: '10px',
        background: 'rgba(0,0,0,0.5)',
        borderTop: '1px solid #00f3ff'
      }}>
        <span style={{
          color: isEliminated ? '#ff4444' : ammo <= 0 ? '#ffaa00' : '#00f3ff',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {isEliminated ? '💀 ELIMINATED - Waiting for game to end' : 
           ammo <= 0 ? '⚠️ NO AMMO - Press reload' : 
           isReloading ? '🔄 RELOADING...' : '✅ READY TO FIRE'}
        </span>
      </div>

      {/* Shop Panel */}
      {shopOpen && (
        <ShopPanel 
          onPurchase={buyItem} 
          onClose={() => setShopOpen(false)} 
          playerPoints={points}
        />
      )}

      {/* Leave Confirmation */}
      {showLeaveConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1a1a2e',
            padding: '30px',
            borderRadius: '15px',
            border: '3px solid #ff4444',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <h2 style={{ color: '#ff4444', marginBottom: '20px' }}>Leave Game?</h2>
            <p style={{ marginBottom: '30px' }}>Are you sure you want to leave the battle? Your progress will be lost.</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button onClick={leaveGame} style={{
                padding: '10px 20px',
                background: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                YES, LEAVE
              </button>
              <button onClick={cancelLeave} style={{
                padding: '10px 20px',
                background: '#333',
                color: '#00f3ff',
                border: '1px solid #00f3ff',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Error */}
      {connectionError && (
        <div style={{
          position: 'fixed', 
          bottom: '20px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          background: 'rgba(255,0,0,0.9)', 
          padding: '15px 25px', 
          borderRadius: '10px', 
          zIndex: 100,
          border: '2px solid #ff4444',
          fontWeight: 'bold'
        }}>
          ⚠️ {connectionError}
        </div>
      )}
    </div>
  );
}