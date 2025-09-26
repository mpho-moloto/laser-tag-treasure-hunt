// Student Number: 2023094242
// Student Number: 2019042973

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/GameLobbyStyles';

export default function GameLobby() {
  const location = useLocation(); // Gets current route location and parameters
  const navigate = useNavigate(); // Enables programmatic navigation
  const { arenaCode, playerTag, Color } = location.state || {}; // Extracts game data from navigation state
  const [fighters, setFighters] = useState([]); // Stores list of players in the lobby
  const [commander, setCommander] = useState(''); // Stores the host/commander player tag
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // Tracks WebSocket connection state
  const socketRef = useRef(null); // Reference to WebSocket connection

  const isHost = commander === playerTag; // Determines if current player is the host

  useEffect(() => {
    // Redirect to home if required game data is missing
    if (!arenaCode || !playerTag || !Color) {
      navigate('/');
      return;
    }
    connectToLobby(); // Establish WebSocket connection
    return () => socketRef.current?.close(); // Cleanup on component unmount
  }, [arenaCode, playerTag, Color]);

  useEffect(() => {
    // Automatically set first player as commander if none exists
    if (!commander && fighters.length > 0) setCommander(fighters[0].tag);
  }, [fighters, commander]);

  const connectToLobby = () => {
    try {
      // Construct WebSocket URL with game parameters
      const wsUrl = `ws://localhost:4000/${arenaCode}/lobby?player=${encodeURIComponent(playerTag)}&color=${encodeURIComponent(Color.replace('#',''))}`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => setConnectionStatus('connected'); // Connection established
      ws.onclose = () => setConnectionStatus('disconnected'); // Connection closed
      ws.onerror = () => setConnectionStatus('error'); // Connection error

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'lobbyUpdate') {
            setFighters(data.players || []); // Update player list
            if (data.commander) setCommander(data.commander); // Update host
            if (data.battleStarted) navigate('/battle', { state: { playerTag, arenaCode, Color } }); // Start battle
          } else if (data.type === 'battleStart' || data.type === 'redirectToBattle') {
            navigate('/battle', { state: { playerTag, arenaCode, Color } }); // Navigate to battle arena
          }
        } catch (err) { console.error('Message parse error:', err); }
      };
    } catch (err) {
      console.error('Connection failed:', err);
      setConnectionStatus('error');
    }
  };

  const startBattle = () => {
    // Only host can start the battle
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: 'startBattle', gameCode: arenaCode }));
    } else alert('Not connected to server. Cannot start battle.');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>⚡ BATTLE LOBBY</h1>
        <div style={styles.infoPanel}>
          <div style={styles.infoItem}><strong>Game Code:</strong> {arenaCode}</div>
          <div style={styles.infoItem}><strong>No of Players:</strong> {fighters.length}</div>
          <div style={styles.infoItem}><strong>Player Name:</strong> <span style={{color:Color}}>{playerTag}</span></div>
          <div style={styles.infoItem}><strong>Host:</strong> {commander || 'None'}</div>
          <div style={styles.infoItem}><strong>Status:</strong> <span style={{color: connectionStatus==='connected'?styles.colors.success: connectionStatus==='connecting'?styles.colors.warning:styles.colors.danger, marginLeft:'5px'}}>{connectionStatus.toUpperCase()}</span></div>
          <div style={styles.infoItem}><strong>Role:</strong> {isHost?'🎯 HOST':'👤 PLAYER'}</div>
        </div>
      </div>

      <div style={styles.playersSection}>
        <h2 style={styles.sectionTitle}>Players in Lobby ({fighters.length})</h2>
        {fighters.length>0 ? (
          <div style={styles.playersGrid}>
            {fighters.map((f,i)=>(
              <div key={i} style={{...styles.playerCard, borderColor: f.tag===commander?styles.colors.gold:f.color, boxShadow: f.tag===commander?'0 0 15px gold':'none'}}>
                <div style={styles.playerInfo}>
                  <span style={styles.playerName}>{f.tag}</span>
                  {f.tag===commander && <span style={styles.crown}>HOST</span>}
                </div>
                <div style={{...styles.colorSwatch, backgroundColor:f.color}} title={f.color}/>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p>Waiting for players...</p>
            <p>Share game code: <strong>{arenaCode}</strong></p>
          </div>
        )}
      </div>

      <div style={styles.controls}>
        {isHost ? (
          <div>
            <button onClick={startBattle} style={styles.startButton}>🚀 START BATTLE</button>
            <p style={styles.hostNote}>You are the host. Click to begin!</p>
          </div>
        ) : (
          <div style={styles.waitingMessage}>
            <div style={styles.loadingSpinner}></div>
            <p>Waiting for host to start the battle...</p>
            <p style={styles.hostName}>Host: <strong>{commander}</strong></p>
          </div>
        )}
        <button onClick={()=>navigate('/')} style={styles.exitButton}>← EXIT LOBBY</button>
      </div>

      {connectionStatus==='error' && (
        <div style={styles.errorBox}>
          <p>⚠️ Cannot connect to game server</p>
          <p>Make sure the server is running on localhost:4000</p>
          <button onClick={connectToLobby} style={styles.retryButton}>🔄 RETRY CONNECTION</button>
        </div>
      )}

      <details style={styles.debugPanel}>
        <summary>Debug Info</summary>
        <pre style={styles.debugText}>{JSON.stringify({playerTag, commander, isHost, fighters:fighters.map(f=>f.tag), connectionStatus, wsState:socketRef.current?.readyState}, null, 2)}</pre>
      </details>
    </div>
  );
}