import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import WeaponBar from '../components/WeaponBar.jsx';
import ShopPanel from '../components/ShopPanel.jsx';
import RadarMap from '../components/RadarMap.jsx';

export default function BattleArena() {
  // ------------------------------
  // React State Hooks
  // ------------------------------
  const [activeGun, setActiveGun] = useState('pistol'); // currently equipped weapon
  const [shopOpen, setShopOpen] = useState(false); // store panel open/close
  const [gameData, setGameData] = useState({}); // game state from server
  const [playerData, setPlayerData] = useState({}); // player stats from server
  const [ammo, setAmmo] = useState(10); // current ammo for active weapon
  const [lives, setLives] = useState(3); // player lives
  const [isReloading, setIsReloading] = useState(false); // reload status
  const [points, setPoints] = useState(0); // score points
  const [isConnecting, setIsConnecting] = useState(true); // connection in progress
  const [connectionError, setConnectionError] = useState(''); // connection error message

  // ------------------------------
  // Router state
  // ------------------------------
  const location = useLocation();
  const { playerTag, arenaCode, teamColor } = location.state || {};

  // ------------------------------
  // Refs
  // ------------------------------
  const socketRef = useRef(null); // WebSocket reference
  const videoRef = useRef(null); // video element reference

  // ------------------------------
  // Weapon configuration
  // ------------------------------
  const weaponConfig = {
    pistol: { name: "Pistol", damage: 15, cost: 0, ammo: 12, icon: "🔫" },
    rifle: { name: "Rifle", damage: 35, cost: 150, ammo: 30, icon: "🔍" },
    shotgun: { name: "Shotgun", damage: 60, cost: 300, ammo: 8, icon: "💥" }
  };

  // ------------------------------
  // Connect to server WebSocket
  // ------------------------------
  const connectToBattle = () => {
    if (!arenaCode || !playerTag) {
      setConnectionError('Missing game data');
      setIsConnecting(false);
      return;
    }

    setIsConnecting(true);
    setConnectionError('');

    // Close existing connection if any
    if (socketRef.current) socketRef.current.close();

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/${arenaCode}/game?player=${encodeURIComponent(playerTag)}&color=${encodeURIComponent((teamColor || 'red').replace('#',''))}`;

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      // ------------------------------
      // WebSocket open
      // ------------------------------
      ws.onopen = () => {
        setIsConnecting(false);
        // Send join message to server
        ws.send(JSON.stringify({ action: 'join', player: playerTag, color: teamColor, weapon: activeGun }));
      };

      // ------------------------------
      // WebSocket message handling
      // ------------------------------
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'arenaUpdate') {
            // Update game and player state from server
            setGameData(data.gameState || {});
            setPlayerData(data.playerStats || {});
            setAmmo(data.playerStats?.ammo ?? weaponConfig[activeGun].ammo);
            setLives(data.playerStats?.lives ?? 3);
            setPoints(data.playerStats?.points ?? 0);
          } else if (data.type === 'hitConfirmed') {
            setPoints(prev => data.points || prev);
          } else if (data.type === 'playerHit') {
            setLives(prev => Math.max(0, prev - (data.damage || 1)));
          } else if (data.type === 'error') {
            setConnectionError(data.message || 'Server error');
          } else if (data.type === 'gameOver') {
            console.log('Game over:', data.message);
          }
        } catch (err) {
          console.error('Message parse error:', err);
        }
      };

      // ------------------------------
      // WebSocket error
      // ------------------------------
      ws.onerror = () => {
        setConnectionError('Connection failed. Check server.');
        setIsConnecting(false);
      };

      // ------------------------------
      // WebSocket closed
      // ------------------------------
      ws.onclose = (event) => {
        setIsConnecting(false);
        if (event.code !== 1000) {
          setConnectionError('Connection lost. Reconnecting...');
          setTimeout(() => {
            if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
              connectToBattle();
            }
          }, 3000);
        }
      };

    } catch (err) {
      setConnectionError('Failed to create connection');
      setIsConnecting(false);
    }
  };

  // ------------------------------
  // Camera initialization
  // ------------------------------
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      if (videoRef.current) videoRef.current.srcObject = stream;

    } catch (err) {
      console.warn('Camera unavailable', err);
    }
  };

  // ------------------------------
  // Effect: Connect and start camera
  // ------------------------------
  useEffect(() => {
    connectToBattle(); // establish WebSocket
    startCamera(); // start camera

    return () => {
      // Cleanup on unmount
      if (socketRef.current) socketRef.current.close();
      if (videoRef.current?.srcObject)
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    };
  }, [arenaCode, playerTag, teamColor]);

  // ------------------------------
  // Weapon actions
  // ------------------------------
  const fireWeapon = () => {
    if (isReloading || ammo <= 0) return;
    setAmmo(prev => prev - 1);

    if (socketRef.current?.readyState === 1) {
      socketRef.current.send(JSON.stringify({ action: 'fire', weapon: activeGun, targetColor: teamColor, damage: weaponConfig[activeGun].damage }));
    }
  };

  const reloadWeapon = () => {
    if (isReloading) return;
    setIsReloading(true);
    setTimeout(() => {
      setAmmo(weaponConfig[activeGun].ammo);
      setIsReloading(false);
    }, 2000);
  };

  const buyItem = (itemType) => {
    if (weaponConfig[itemType] && points >= weaponConfig[itemType].cost) {
      setPoints(prev => prev - weaponConfig[itemType].cost);
      setActiveGun(itemType);
      setAmmo(weaponConfig[itemType].ammo);
      setShopOpen(false);

      if (socketRef.current?.readyState === 1) {
        socketRef.current.send(JSON.stringify({ action: 'purchase', item: itemType }));
      }
    }
  };

  const switchWeapon = (weapon) => {
    if (playerData.weapons?.includes(weapon) || weapon === 'pistol') {
      setActiveGun(weapon);
      setAmmo(weaponConfig[weapon].ammo);
    }
  };

  // ------------------------------
  // Conditional rendering
  // ------------------------------
  if (!playerTag || !arenaCode) {
    return <div style={{ background:'#0a0a0a', color:'white', minHeight:'100vh', display:'flex', justifyContent:'center', alignItems:'center' }}><h1>❌ Missing Game Data</h1></div>;
  }

  if (isConnecting) {
    return <div style={{ background:'#0a0a0a', color:'white', minHeight:'100vh', display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
      <h1>🔄 Connecting to Battle...</h1>
      {connectionError && <p style={{color:'#ff6b6b'}}>{connectionError}</p>}
      <button onClick={connectToBattle}>Retry Connection</button>
    </div>;
  }

  // Only render if actual server data exists
  const combatants = gameData.combatants || [];
  const currentWeapon = weaponConfig[activeGun];
  const unlockedWeapons = playerData.weapons || ['pistol'];

  // ------------------------------
  // Render UI
  // ------------------------------
  return (
    <div className="battle-arena" style={{ background:'#0a0a0a', minHeight:'100vh', color:'white' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 20px', borderBottom:'2px solid #00f3ff' }}>
        <div>Ammo: {ammo}/{currentWeapon.ammo}</div>
        <div>Lives: {lives}</div>
        <div>Points: {points}</div>
        <div>Weapon: {currentWeapon.name}</div>
        <button onClick={()=>setShopOpen(true)}>🛒 STORE</button>
      </div>

      {/* Camera */}
      <div className="camera-container" style={{ position:'relative', padding:'20px' }}>
        <video ref={videoRef} autoPlay muted style={{ width:'100%', height:'60vh', objectFit:'cover', border:'3px solid #00f3ff', borderRadius:'10px', background:'#222' }} />
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', fontSize:'40px', color:'#00f3ff' }}>✜</div>
      </div>

      {/* Minimap */}
      <RadarMap players={combatants} />

      {/* Controls */}
      <div style={{ display:'flex', gap:'10px', padding:'20px' }}>
        <button onClick={fireWeapon} disabled={ammo<=0 || isReloading}>{ammo<=0?'❌':'🔥'} FIRE</button>
        <WeaponBar weapons={weaponConfig} currentWeapon={activeGun} onWeaponSelect={switchWeapon} unlockedWeapons={unlockedWeapons}/>
        <button onClick={reloadWeapon} disabled={isReloading || ammo===currentWeapon.ammo}>{isReloading?'🔄':'🔃'} RELOAD</button>
      </div>

      {/* Shop */}
      {shopOpen && <ShopPanel items={weaponConfig} onPurchase={buyItem} onClose={()=>setShopOpen(false)} playerPoints={points}/>}

      {/* Error */}
      {connectionError && <div style={{position:'fixed', top:'10px', right:'10px', background:'rgba(255,0,0,0.8)', padding:'10px', borderRadius:'5px'}}>{connectionError}</div>}
    </div>
  );
}
