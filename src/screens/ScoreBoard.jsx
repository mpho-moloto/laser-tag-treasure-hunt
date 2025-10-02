// Student Number: 2023094242
// Student Number: 2019042973

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ScoreBoardStyles from '../styles/ScoreBoardStyles';

export default function ScoreBoard() {
  const [combatants, setCombatants] = useState([]); // Stores player results data
  const [winner, setWinner] = useState(''); // Stores the winner's name
  const [winCondition, setWinCondition] = useState(''); // Stores how the game was won
  const location = useLocation(); // Gets navigation state
  const navigate = useNavigate(); // For page navigation

  // Extract game results from navigation state
  const { arenaCode, playerTag, results, winner: gameWinner, winCondition: condition } = location.state || {};

  useEffect(() => {
    if (results && results.length > 0) {
      setCombatants(results);
      setWinner(gameWinner || results[0]?.tag); // Set winner from props or default to first player
      setWinCondition(condition || 'points');
    } else {
      navigate('/'); // Redirect if no results data
    }
  }, [results, gameWinner, condition, navigate]);

  // Calculate shooting accuracy percentage
  const getAccuracy = (player) => {
    const totalShots = (player.hits || 0) + (player.misses || 0);
    return totalShots > 0 ? Math.round(((player.hits || 0) / totalShots) * 100) : 0;
  };

  // Calculate kill/death ratio
  const getKDRatio = (player) => {
    const kills = player.eliminations || 0;
    const deaths = player.deaths || 0;
    return deaths > 0 ? (kills / deaths).toFixed(2) : kills > 0 ? 'Perfect' : '0.00';
  };

  // Convert win condition code to readable text
  const getWinConditionText = () => {
    switch (winCondition) {
      case 'last_man_standing':
        return 'Last Player Standing';
      case 'time_up':
        return 'Time Expired - Most Points';
      case 'draw':
        return 'Draw Game';
      default:
        return 'Victory by Points';
    }
  };

  if (combatants.length === 0) {
    return (
      <div style={ScoreBoardStyles.container}>
        <div style={ScoreBoardStyles.loading}>
          <h1>Loading Battle Results...</h1>
        </div>
      </div>
    );
  }

  return (
    <div style={ScoreBoardStyles.container}>
      <header style={ScoreBoardStyles.header}>
        <h1 style={ScoreBoardStyles.title}>🏆 Last Lap Results</h1>
        <div style={ScoreBoardStyles.winnerSection}>
          <div style={ScoreBoardStyles.winnerLabel}>VICTORY GOES TO</div>
          <div style={{ ...ScoreBoardStyles.winnerName, color: combatants.find(p => p.tag === winner)?.color || '#0ff' }}>
            {winner}
          </div>
          <div style={ScoreBoardStyles.winCondition}>{getWinConditionText()}</div>
          {winner === playerTag && <div style={ScoreBoardStyles.youWon}>🎉 YOU WON! 🎉</div>}
        </div>
        <div style={ScoreBoardStyles.arenaInfo}>Arena: {arenaCode || 'COMPLETED'}</div>
      </header>

      <section style={ScoreBoardStyles.tableSection}>
        <div style={ScoreBoardStyles.tableHeader}>
          <span>RANK</span>
          <span>PLAYER</span>
          <span>SCORE</span>
          <span>KILLS</span>
          <span>ACCURACY</span>
          <span>K/D</span>
          <span>STATUS</span>
        </div>

        {combatants.map((player, index) => (
          <div
            key={player.tag}
            style={{
              ...ScoreBoardStyles.tableRow,
              ...(player.tag === winner ? ScoreBoardStyles.winnerRow : {}), // Highlight winner
              ...(player.tag === playerTag ? ScoreBoardStyles.yourRow : {}), // Highlight current player
              ...(index < 3 ? ScoreBoardStyles[`podium${index + 1}`] : {}) // Special styles for top 3
            }}
          >
            <span style={ScoreBoardStyles.rank}>
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
            </span>
            <span style={{ ...ScoreBoardStyles.playerName, color: player.color }}>
              {player.tag}
              {player.tag === playerTag && <span style={ScoreBoardStyles.youIndicator}> (YOU)</span>}
            </span>
            <span style={ScoreBoardStyles.score}>{player.points || 0}</span>
            <span>{player.eliminations || 0}</span>
            <span>{getAccuracy(player)}%</span>
            <span>{getKDRatio(player)}</span>
            <span style={{
              color: player.isEliminated ? '#ff4444' : '#00ff00',
              fontWeight: 'bold'
            }}>
              {player.isEliminated ? 'ELIMINATED' : 'SURVIVED'}
            </span>
          </div>
        ))}
      </section>

      <section style={ScoreBoardStyles.summarySection}>
        <div style={ScoreBoardStyles.summaryItem}>
          <span>Total Players:</span> <span>{combatants.length}</span>
        </div>
        <div style={ScoreBoardStyles.summaryItem}>
          <span>Total Kills:</span> <span>{combatants.reduce((sum, p) => sum + (p.eliminations || 0), 0)}</span>
        </div>
        <div style={ScoreBoardStyles.summaryItem}>
          <span>Game Duration:</span> <span>5:00</span>
        </div>
      </section>

      <section style={ScoreBoardStyles.actions}>
        <button onClick={() => navigate('/')} style={ScoreBoardStyles.homeBtn}>🏠 MAIN MENU</button>
        <button onClick={() => navigate('/scan', { state: { arenaCode } })} style={ScoreBoardStyles.rematchBtn}>🔄 PLAY AGAIN</button>
      </section>
    </div>
  );
}