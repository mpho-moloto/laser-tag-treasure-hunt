import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function GameLobby() {
  const location = useLocation();
  const navigate = useNavigate();

  const { arenaCode, playerTag, teamColor } = location.state || {};
  const [fighters, setFighters] = useState([]);
  const [commander, setCommander] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const socketRef = useRef(null);

  const isHost = commander === playerTag;

  useEffect(() => {
    if (!arenaCode || !playerTag || !teamColor) {
      navigate('/');
      return;
    }

    connectToLobby();

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [arenaCode, playerTag, teamColor]);

  // Auto-assign first player as host if server hasn't sent commander yet
  useEffect(() => {
    if (!commander && fighters.length > 0) {
      setCommander(fighters[0].tag);
    }
  }, [fighters, commander]);

  const connectToLobby = () => {
    try {
      const wsUrl = `ws://localhost:4000/${arenaCode}/lobby?player=${encodeURIComponent(
        playerTag
      )}&color=${encodeURIComponent(teamColor.replace('#', ''))}`;

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => setConnectionStatus('connected');
      ws.onclose = () => setConnectionStatus('disconnected');
      ws.onerror = () => setConnectionStatus('error');

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'lobbyUpdate') {
            setFighters(data.players || []);
            if (data.commander) setCommander(data.commander);

            if (data.battleStarted) {
              navigate('/battle', { state: { playerTag, arenaCode, teamColor } });
            }
          } else if (data.type === 'battleStart') {
            navigate('/battle', { state: { playerTag, arenaCode, teamColor } });
          }
        } catch (err) {
          console.error('Message parse error:', err);
        }
      };
    } catch (err) {
      console.error('Connection failed:', err);
      setConnectionStatus('error');
    }
  };

  const startBattle = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ action: 'startBattle', gameCode: arenaCode })
      );
    } else {
      alert('Not connected to server. Cannot start battle.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>⚡ BATTLE LOBBY</h1>
        <div style={styles.infoPanel}>
          <div style={styles.infoItem}>
            <strong>Game Code:</strong> {arenaCode}
          </div>
          <div style={styles.infoItem}>
            <strong>Players:</strong> {fighters.length}
          </div>
          <div style={styles.infoItem}>
            <strong>Your Name:</strong> <span style={{ color: teamColor }}>{playerTag}</span>
          </div>
          <div style={styles.infoItem}>
            <strong>Host:</strong> {commander || 'None'}
          </div>
          <div style={styles.infoItem}>
            <strong>Status:</strong>{' '}
            <span
              style={{
                color:
                  connectionStatus === 'connected'
                    ? '#0f0'
                    : connectionStatus === 'connecting'
                    ? '#ff0'
                    : '#f00',
                marginLeft: '5px',
              }}
            >
              {connectionStatus.toUpperCase()}
            </span>
          </div>
          <div style={styles.infoItem}>
            <strong>You are:</strong> {isHost ? '🎯 HOST' : '👤 PLAYER'}
          </div>
        </div>
      </div>

      <div style={styles.playersSection}>
        <h2 style={styles.sectionTitle}>Players in Lobby ({fighters.length})</h2>
        {fighters.length > 0 ? (
          <div style={styles.playersGrid}>
            {fighters.map((fighter, index) => (
              <div
                key={index}
                style={{
                  ...styles.playerCard,
                  borderColor: fighter.tag === commander ? '#FFD700' : fighter.color,
                  boxShadow: fighter.tag === commander ? '0 0 15px gold' : 'none',
                }}
              >
                <div style={styles.playerInfo}>
                  <span style={styles.playerName}>{fighter.tag}</span>
                  {fighter.tag === commander && <span style={styles.crown}>HOST</span>}
                </div>
                <div
                  style={{ ...styles.colorSwatch, backgroundColor: fighter.color }}
                  title={fighter.color}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p>Waiting for players...</p>
            <p>
              Share game code: <strong>{arenaCode}</strong>
            </p>
          </div>
        )}
      </div>

      <div style={styles.controls}>
        {isHost ? (
          <div>
            <button onClick={startBattle} style={styles.startButton}>
              🚀 START BATTLE
            </button>
            <p style={styles.hostNote}>You are the host. Click to begin!</p>
          </div>
        ) : (
          <div style={styles.waitingMessage}>
            <div style={styles.loadingSpinner}></div>
            <p>Waiting for host to start the battle...</p>
            <p style={styles.hostName}>
              Host: <strong>{commander}</strong>
            </p>
          </div>
        )}
        <button onClick={() => navigate('/')} style={styles.exitButton}>
          ← EXIT LOBBY
        </button>
      </div>

      {connectionStatus === 'error' && (
        <div style={styles.errorBox}>
          <p>⚠️ Cannot connect to game server</p>
          <p>Make sure the server is running on localhost:4000</p>
          <button onClick={connectToLobby} style={styles.retryButton}>
            🔄 RETRY CONNECTION
          </button>
        </div>
      )}

      <details style={styles.debugPanel}>
        <summary>Debug Info</summary>
        <pre style={styles.debugText}>
          {JSON.stringify(
            {
              playerTag,
              commander,
              isHost,
              fighters: fighters.map((f) => f.tag),
              connectionStatus,
              wsState: socketRef.current?.readyState,
            },
            null,
            2
          )}
        </pre>
      </details>
    </div>
  );
}

const styles = {
  container: { background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)', minHeight: '100vh', color: 'white', padding: '20px', fontFamily: 'Arial, sans-serif' },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { color: '#00f3ff', textShadow: '0 0 10px #00f3ff', fontSize: '2.5rem', marginBottom: '20px' },
  infoPanel: { background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '10px', display: 'inline-block', textAlign: 'left' },
  infoItem: { margin: '5px 0', fontSize: '14px' },
  playersSection: { textAlign: 'center', marginBottom: '30px' },
  sectionTitle: { color: '#00f3ff', marginBottom: '20px' },
  playersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', maxWidth: '800px', margin: '0 auto' },
  playerCard: { padding: '15px', border: '2px solid', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s ease' },
  playerInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  playerName: { fontWeight: 'bold', fontSize: '16px' },
  crown: { fontSize: '0.9rem', background: '#FFD700', color: '#000', borderRadius: '3px', padding: '2px 4px', marginLeft: '5px' },
  colorSwatch: { width: '20px', height: '20px', borderRadius: '50%', border: '2px solid white' },
  emptyState: { padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', margin: '20px auto', maxWidth: '400px' },
  controls: { textAlign: 'center', marginBottom: '20px' },
  startButton: { padding: '15px 30px', background: 'linear-gradient(45deg, #00ff00, #00cc00)', color: '#000', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', margin: '10px', boxShadow: '0 0 20px #00ff00' },
  hostNote: { fontSize: '14px', opacity: 0.8, marginTop: '5px' },
  waitingMessage: { padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', margin: '20px auto', maxWidth: '400px' },
  loadingSpinner: { width: '30px', height: '30px', border: '3px solid #333', borderTop: '3px solid #00f3ff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' },
  hostName: { color: '#00f3ff', fontWeight: 'bold' },
  exitButton: { padding: '10px 20px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '10px', fontSize: '14px' },
  errorBox: { background: 'rgba(255, 0, 0, 0.2)', padding: '15px', borderRadius: '10px', textAlign: 'center', margin: '20px 0', border: '1px solid #ff4444' },
  retryButton: { padding: '8px 16px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' },
  debugPanel: { background: 'rgba(0, 0, 0, 0.5)', padding: '10px', borderRadius: '5px', marginTop: '20px', fontSize: '12px' },
  debugText: { margin: 0, fontSize: '10px' },
};

// Add spinner animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`, styleSheet.cssRules.length);
