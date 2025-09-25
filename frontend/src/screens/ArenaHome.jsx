import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ArenaHome() {
  const [arenaId, setArenaId] = useState('');
  const navigate = useNavigate();

  const validateCode = (code) => code.length === 4 && /^[A-Za-z]+$/.test(code);

  const enterAsFighter = () => {
    if (!validateCode(arenaId)) {
      alert('Need 4-letter arena code');
      return;
    }
    navigate('/scan', { state: { arenaCode: arenaId.toLowerCase() } });
  };

  const enterAsWatcher = () => {
    if (!validateCode(arenaId)) {
      alert('Need 4-letter arena code');
      return;
    }
    navigate('/watch', { state: { arenaCode: arenaId.toLowerCase() } });
  };

  return (
    <div className="home-screen cyber-bg">
      <div className="title-section">
        <h1 className="main-title">NEON ARENA</h1>
        <p className="tagline">Laser Combat Zone</p>
      </div>

      <div className="access-panel glow-border">
        <h2>ENTER ARENA CODE</h2>
        <input
          type="text"
          value={arenaId}
          onChange={(e) => setArenaId(e.target.value.replace(/[^A-Za-z]/g, '').substring(0, 4))}
          placeholder="ABCD"
          className="code-input"
        />

        <div className="entry-buttons">
          <button onClick={enterAsFighter} className="fighter-btn">
            JOIN BATTLE
          </button>
          <button onClick={enterAsWatcher} className="watcher-btn">
            SPECTATE
          </button>
        </div>
      </div>

      <div className="footer-glow">
        <p>Choose your role in the arena</p>
      </div>
    </div>
  );
}