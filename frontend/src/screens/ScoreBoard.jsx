import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ScoreBoard() {
  const [combatants, setCombatants] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { arenaCode, playerTag } = location.state || {};

  useEffect(() => {
    // Load battle results
    const results = [
      { tag: 'PLAYER1', color: '#FF0000', score: 850, hitsOut: 12, hitsIn: 3 },
      { tag: 'PLAYER2', color: '#00FF00', score: 720, hitsOut: 9, hitsIn: 5 },
      { tag: 'PLAYER3', color: '#0000FF', score: 610, hitsOut: 7, hitsIn: 8 }
    ];
    setCombatants(results);
  }, []);

  return (
    <div className="score-screen">
      <div className="score-header">
        <h1>BATTLE RESULTS</h1>
        <p>Arena: {arenaCode || 'COMPLETED'}</p>
      </div>

      <div className="ranking-table">
        <div className="table-header glow-row">
          <span>RANK</span>
          <span>FIGHTER</span>
          <span>HITS OUT</span>
          <span>HITS IN</span>
          <span>SCORE</span>
        </div>

        {combatants.map((fighter, index) => (
          <div key={fighter.tag} className={`rank-row ${index < 3 ? 'podium-' + (index + 1) : ''}`}>
            <span className="rank-number">#{index + 1}</span>
            <span className="fighter-tag" style={{ color: fighter.color }}>
              {fighter.tag}
            </span>
            <span>{fighter.hitsOut}</span>
            <span>{fighter.hitsIn}</span>
            <span className="score-value">{fighter.score}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={() => navigate('/')}
        className="return-home"
      >
        MAIN MENU
      </button>
    </div>
  );
}