// Student Number: 2023094242
// Student Number: 2019042973

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/SpectatorModeStyles';

/**
 * SpectatorMode Component - Allows users to spectate ongoing laser tag battles
 * Features live player rankings, detailed stats, and real-time game updates
 */
export default function SpectatorMode() {
  const [gameData, setGameData] = useState({}); // Stores live game state from server
  const [selectedPlayer, setSelectedPlayer] = useState(null); // Currently selected player for details view
  const [timeLeft, setTimeLeft] = useState(300); // Game timer countdown
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // WebSocket connection status

  const socketRef = useRef(null); // Reference to WebSocket connection
  const location = useLocation(); // Access route parameters
  const navigate = useNavigate(); // Programmatic navigation
  const { arenaCode } = location.state || {}; // Extract arena code from navigation state

  useEffect(() => {
    if (!arenaCode) {
      navigate('/'); // Redirect if no arena code provided
      return;
    }
    connectAsSpectator(); // Establish WebSocket connection
    return () => socketRef.current?.close(); // Cleanup on unmount
  }, [arenaCode, navigate]);

  const connectAsSpectator = () => {
    const ws = new WebSocket(`ws://localhost:4000/${arenaCode}/spectate`); // Connect to spectate endpoint
    socketRef.current = ws;

    ws.onopen = () => setConnectionStatus('connected');
    ws.onclose = () => setConnectionStatus('disconnected');
    ws.onerror = () => setConnectionStatus('error');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'spectatorUpdate') {
          setGameData(data.gameState || {}); // Update live game data
          setTimeLeft(data.gameState?.timeRemaining || 300); // Update timer
        } else if (data.type === 'battleStart') {
          setGameData(prev => ({ ...prev, battleStarted: true })); // Mark battle as started
        } else if (data.type === 'gameEnd') {
          navigate('/scores', { // Navigate to results screen when game ends
            state: { 
              arenaCode,
              results: data.results,
              winner: data.winner,
              winCondition: data.winCondition
            } 
          });
        }
      } catch (err) {
        console.error('Message parse error:', err);
      }
    };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`; // Format as MM:SS
  };

  const getAccuracy = (player) => {
    const totalShots = (player.hits || 0) + (player.misses || 0);
    return totalShots > 0 ? Math.round(((player.hits || 0)/totalShots)*100) : 0; // Calculate hit percentage
  };

  const combatants = gameData.combatants || [];
  const sortedPlayers = [...combatants].sort((a,b)=>b.points-a.points); // Sort players by points descending

  if (!arenaCode) return <div style={styles.container}><div style={styles.error}>Missing game code</div></div>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>👁️ SPECTATOR MODE</h1>
        <div style={styles.gameInfo}>
          <div style={styles.infoItem}>Arena: <strong>{arenaCode}</strong></div>
          <div style={styles.infoItem}>
            Time: <strong style={{color: timeLeft<60?styles.colors.danger:styles.colors.primary}}>{formatTime(timeLeft)}</strong>
          </div>
          <div style={styles.infoItem}>
            Status: <span style={{color: connectionStatus==='connected'?styles.colors.success:styles.colors.danger}}>{connectionStatus.toUpperCase()}</span>
          </div>
          <div style={styles.infoItem}>Players: <strong>{combatants.length}</strong></div>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {selectedPlayer ? (
          <PlayerDetail player={selectedPlayer} goBack={()=>setSelectedPlayer(null)} getAccuracy={getAccuracy} />
        ) : (
          <RankingsView players={sortedPlayers} selectPlayer={setSelectedPlayer} />
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <button onClick={()=>navigate('/')} style={styles.exitButton}>🏠 Return to Main Menu</button>
        <div style={styles.spectatorCount}>👁️ Spectating: {arenaCode}</div>
      </div>

      {connectionStatus==='error' && (
        <div style={styles.errorBanner}>
          ⚠️ Connection lost. Trying to reconnect...
          <button onClick={connectAsSpectator} style={styles.retryButton}>Retry</button>
        </div>
      )}
    </div>
  );
}

/* --- Reusable Components --- */

const StatCard = ({value,label}) => (
  <div style={styles.statCard}>
    <div style={styles.statValue}>{value}</div>
    <div style={styles.statLabel}>{label}</div>
  </div>
);

const HealthBar = ({health}) => (
  <div style={styles.healthBar}>
    <div style={{width:`${health}%`, background:health>50?styles.colors.success:health>25?styles.colors.warning:styles.colors.danger, height:'100%', borderRadius:'5px', transition:'all 0.3s'}}/>
    {health}%
  </div>
);

const RankingItem = ({player,rank,onClick}) => (
  <div onClick={onClick} style={{...styles.rankingItem,...(player.isEliminated?styles.eliminatedItem:{})}}>
    <span style={styles.rankNumber}>{rank===0?'🥇':rank===1?'🥈':rank===2?'🥉':`#${rank+1}`}</span>
    <span style={styles.playerInfo}><div style={{...styles.colorDot,backgroundColor:player.color}}></div>{player.tag}</span>
    <span style={styles.points}>{player.points||0}</span>
    <span>{player.eliminations||0}</span>
    <span style={{color:player.isEliminated?styles.colors.danger:styles.colors.success}}>{player.isEliminated?'💀 ELIMINATED':'✅ ACTIVE'}</span>
  </div>
);

const RankingsView = ({players,selectPlayer}) => (
  <div style={styles.rankings}>
    <h2 style={styles.rankingsTitle}>LIVE RANKINGS</h2>
    <div style={styles.rankingsHeader}><span>RANK</span><span>PLAYER</span><span>POINTS</span><span>KILLS</span><span>STATUS</span></div>
    <div style={styles.rankingsList}>
      {players.map((p,i)=><RankingItem key={p.tag} player={p} rank={i} onClick={()=>selectPlayer(p)} />)}
    </div>
    {players.length===0 && (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>👀</div>
        <h3>Waiting for players to join...</h3>
        <p>The game will appear here once players start battling</p>
      </div>
    )}
  </div>
);

const PlayerDetail = ({player,goBack,getAccuracy}) => (
  <div style={styles.playerDetail}>
    <button onClick={goBack} style={styles.backButton}>← Back to Rankings</button>
    <div style={styles.playerHeader}>
      <div style={{...styles.playerColor, backgroundColor:player.color}}></div>
      <h2 style={styles.playerName}>{player.tag}</h2>
      {player.isEliminated && <span style={styles.eliminatedTag}>ELIMINATED</span>}
    </div>

    <div style={styles.statsGrid}>
      <StatCard value={player.points||0} label="POINTS"/>
      <StatCard value={`${player.lives} ❤️`} label="LIVES"/>
      <StatCard value={<HealthBar health={player.health}/>} label="HEALTH"/>
      <StatCard value={player.ammo} label="AMMO"/>
      <StatCard value={player.eliminations||0} label="ELIMINATIONS"/>
      <StatCard value={`${getAccuracy(player)}%`} label="ACCURACY"/>
    </div>

    <div style={styles.weaponsSection}>
      <h3 style={styles.sectionTitle}>WEAPONS</h3>
      <div style={styles.weaponsList}>
        {(player.weapons||[]).map((w,i)=>(
          <div key={i} style={styles.weaponItem}>
            <img src={`/images/${w}.png`} alt={w} style={styles.weaponImage}/>
            <span>{w.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);