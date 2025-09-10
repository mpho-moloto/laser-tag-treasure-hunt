import React from "react";
import { GameProvider, useGame } from "./context/GameContext";
import LoginScreen from "./components/LoginScreen";
import LobbyScreen from "./components/LobbyScreen";
import GameScreen from "./components/GameScreen";
import SpectatorScreen from "./components/SpectatorScreen";
import WinnerScreen from "./components/WinnerScreen";


const AppContent: React.FC = () => {
  const { currentView } = useGame();

  return (
    <div className="app-container">
      {currentView === "login" && <LoginScreen />}
      {currentView === "lobby" && <LobbyScreen />}
      {currentView === "game" && <GameScreen />}
      {currentView === "spectator" && <SpectatorScreen />}
      {currentView === "winner" && <WinnerScreen />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;