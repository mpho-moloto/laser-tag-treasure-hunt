// Student Number: 2023094242
// Student Number: 2019042973

import React, { useState } from 'react'; // Import React and useState hook to manage component state
import { useNavigate } from 'react-router-dom'; // Import useNavigate to programmatically navigate between routes
import ArenaHomeStyles from '../styles/ArenaHomeStyles'; // Import styling object for this component

export default function ArenaHome() {
  const [arenaId, setArenaId] = useState(''); // State to store the 3-digit arena code input
  const navigate = useNavigate(); // Hook to navigate to other pages

  // Function to validate that the input is exactly 3 digits
  const validateCode = (code) => /^\d{3}$/.test(code);

  // Function to enter the arena as a fighter
  const enterAsFighter = () => {
    if (!validateCode(arenaId)) { // If code is invalid
      alert('Need 3-digit arena code'); // Show alert message
      return; // Stop execution
    }
    navigate('/scan', { state: { arenaCode: arenaId } }); // Navigate to '/scan' and pass arena code
  };

  // Function to enter the arena as a watcher/spectator
  const enterAsWatcher = () => {
    if (!validateCode(arenaId)) { // If code is invalid
      alert('Need 3-digit arena code'); // Show alert message
      return; // Stop execution
    }
    navigate('/spectate', { state: { arenaCode: arenaId } }); // Navigate to '/spectate' and pass arena code
  };

  return (
    <div style={ArenaHomeStyles.container}>
      {/* Title section */}
      <div style={ArenaHomeStyles.titleSection}>
        <h1 style={ArenaHomeStyles.mainTitle}>Last Lap</h1> {/* Main heading */}
        <p style={ArenaHomeStyles.tagline}>Laser Combat Zone</p> {/* Subheading / tagline */}
      </div>

      {/* Arena code input panel */}
      <div style={ArenaHomeStyles.accessPanel}>
        <h2 style={ArenaHomeStyles.panelTitle}>Create Arena Code</h2>
        <input
          type="text"
          value={arenaId} // Bind input value to arenaId state
          onChange={(e) =>
            setArenaId(
              e.target.value.replace(/[^0-9]/g, '').substring(0, 3) // Only allow digits and limit to 3 characters
            )
          }
          placeholder="123" // Placeholder text
          style={ArenaHomeStyles.codeInput}
        />

        {/* Buttons to choose role */}
        <div style={ArenaHomeStyles.entryButtons}>
          <button onClick={enterAsFighter} style={ArenaHomeStyles.fighterBtn}>
            🎯 BATTLE {/* Fighter button */}
          </button>
          <button onClick={enterAsWatcher} style={ArenaHomeStyles.watcherBtn}>
            👁️ SPECTATE {/* Spectator button */}
          </button>
        </div>
      </div>

      {/* Footer section */}
      <div style={ArenaHomeStyles.footer}>
        <p>Choose your role in the arena</p> {/* Footer text */}
      </div>
    </div>
  );
}
