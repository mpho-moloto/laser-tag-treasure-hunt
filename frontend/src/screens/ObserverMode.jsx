import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ObserverMode() {
  const [combatData, setCombatData] = useState([]);
  const [currentView, setCurrentView] = useState(0);
  const [matchTime, setMatchTime] = useState('05:00');
  const socketRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { arenaCode } = location.state || {};

  useEffect(() => {
    connectAsObserver();
  }, [arenaCode]);

  const connectAsObserver = () => {
    const ws = new WebSocket(`ws://localhost:4000/observer/${arenaCode}`);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'arenaStatus') {
        setCombatData(data.fighters);
        setMatchTime(formatTime(data.timeLeft));
        
        if (data.timeLeft === 0) {
          navigate('/scores', { state: { arenaCode, results: data.fighters } });
        }
      }
    };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const nextFighter = () => {
    setCurrentView((prev) => (prev + 1) % combatData.length);
  };

  const prevFighter = () => {
    setCurrentView((prev) => (prev - 1 + combatData.length) % combatData.length);
  };

  const currentFighter = combatData[currentView] || {};

  return (
    <div className="observer-view">
      <div className="observer-header">
        <h1>OBSERVER MODE</h1>
        <div className="match-timer">{matchTime}</div>
      </div>

      {combatData.length > 0 ? (
        <div className="stats-display">
          <div className="fighter-stats-card">
            <h2 className="fighter-name-glow">{currentFighter.tag || 'SELECT FIGHTER'}</h2>
            
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">SCORE</span>
                <span className="stat-value">{currentFighter.points || 0}</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">HITS OUT</span>
                <span className="stat-value">{currentFighter.hitsOut || 0}</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">HITS IN</span>
                <span className="stat-value">{currentFighter.hitsIn || 0}</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">ACCURACY</span>
                <span className="stat-value">
                  {currentFighter.hitsOut ? 
                   Math.round((currentFighter.hitsOut / (currentFighter.hitsOut + currentFighter.misses || 1)) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {combatData.length > 1 && (
            <div className="observer-nav">
              <button onClick={prevFighter} className="nav-btn">◀ PREV</button>
              <span className="nav-info">Viewing {currentView + 1} of {combatData.length}</span>
              <button onClick={nextFighter} className="nav-btn">NEXT ▶</button>
            </div>
          )}
        </div>
      ) : (
        <div className="waiting-message">
          <p>Waiting for battle data...</p>
          <div className="loading-pulse"></div>
        </div>
      )}

      <button onClick={() => navigate('/')} className="observer-exit">
        EXIT OBSERVER MODE
      </button>
    </div>
  );
}