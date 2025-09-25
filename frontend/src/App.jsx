import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ArenaHome from "./screens/ArenaHome.jsx";
import ColorScan from "./screens/ColorScan.jsx";
import BattleArena from "./screens/BattleArena.jsx";
import GameLobby from "./screens/GameLobby.jsx";
import ScoreBoard from "./screens/ScoreBoard.jsx";
import ObserverMode from "./screens/ObserverMode.jsx";

function CyberArena() {
  return (
    <Router>
      <div className="cyber-container">
        <Routes>
          <Route path="/" element={<ArenaHome />} />
          <Route path="/scan" element={<ColorScan />} />
          <Route path="/battle" element={<BattleArena />} />
          <Route path="/lobby" element={<GameLobby />} />
          <Route path="/scores" element={<ScoreBoard />} />
          <Route path="/watch" element={<ObserverMode />} />
        </Routes>
      </div>
    </Router>
  );
}

export default CyberArena;