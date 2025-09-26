// Student Number: 2023094242
// Student Number: 2019042973

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ArenaHome from "./screens/ArenaHome.jsx";
import ColorScan from "./screens/ColorScan.jsx";
import BattleArena from "./screens/BattleArena.jsx";
import GameLobby from "./screens/GameLobby.jsx";
import ScoreBoard from "./screens/ScoreBoard.jsx";
import SpectatorMode from './screens/SpectatorMode.jsx';

function CyberArena() {
  return (
    <Router> {/* Main router wrapper for client-side routing */}
      <div className="cyber-container">
        <Routes> {/* Container for route definitions */}
          {/* Define all application routes with corresponding components */}
          <Route path="/" element={<ArenaHome />} /> {/* Home/Main menu screen */}
          <Route path="/scan" element={<ColorScan />} /> {/* Team color selection screen */}
          <Route path="/battle" element={<BattleArena />} /> {/* Main game battle screen */}
          <Route path="/lobby" element={<GameLobby />} /> {/* Pre-game waiting lobby */}
          <Route path="/scores" element={<ScoreBoard />} /> {/* Post-game results screen */}
          <Route path="/spectate" element={<SpectatorMode />} /> {/* Spectator view mode */}
        </Routes>
      </div>
    </Router>
  );
}

export default CyberArena;