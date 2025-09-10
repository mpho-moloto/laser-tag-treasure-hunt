import React, { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";

const LobbyScreen: React.FC = () => {
  const { player, currentLobby, availableLobbies, createLobby, joinLobby, startGame, socket, spectateLobby } = useGame();
  const [lobbyName, setLobbyName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { socket && socket.emit("get-lobbies", {}); }, [socket]);

  const handleCreateLobby = () => {
    if (!lobbyName.trim()) return setError("Please enter a lobby name");
    setError(""); createLobby(lobbyName.trim());
  };

  const handleJoinLobby = () => {
    if (!joinCode.trim()) return setError("Please enter a lobby code");
    const lobbyId = parseInt(joinCode);
    if (isNaN(lobbyId)) return setError("Invalid lobby code");
    setError(""); joinLobby(lobbyId);
  };

  const handleStartGame = () => {
    if (!currentLobby || currentLobby.players.length < 2) return setError("Need at least 2 players to start");
    startGame();
  };

  const cyberpunkText = (color: string, size: string, shadow: string) => ({ 
    color, fontSize: size, textShadow: shadow, fontWeight: 'bold' 
  });

  const cyberpunkButton = (gradient: string, textColor: string) => ({
    padding: '15px 30px', border: 'none', borderRadius: '10px', background: gradient,
    color: textColor, fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', width: '100%',
    boxShadow: `0 0 20px ${textColor === 'black' ? 'rgba(0, 255, 255, 0.3)' : 'rgba(255, 0, 128, 0.3)'}`
  });

  const cyberpunkCard = () => ({
    padding: '25px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '15px', 
    border: '2px solid rgba(0, 255, 255, 0.2)', textAlign: 'center' as const
  });

  return (
    <div style={{ maxWidth: "900px", margin: "20px", padding: "40px", background: "rgba(0, 0, 0, 0.8)", 
                  borderRadius: "20px", border: "2px solid rgba(0, 255, 255, 0.3)", backdropFilter: "blur(10px)" }}>
      
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={cyberpunkText('#00ffff', '3.5rem', '0 0 30px rgba(0, 255, 255, 0.5)')}>🎮 BATTLE LOBBY TERMINAL</h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "15px" }}>
          <div style={{ width: "25px", height: "25px", borderRadius: "50%", border: "2px solid #00ffff", 
                        backgroundColor: player?.color, boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)" }} />
          <span style={cyberpunkText('#00ffff', '1.2rem', '0 0 10px rgba(0, 255, 255, 0.5)')}>{player?.name}</span>
        </div>
      </div>

      {currentLobby ? (
        /* Current Lobby View */
        <div style={{ textAlign: "center" }}>
          <h2 style={cyberpunkText('#00ffff', '2rem', '0 0 15px rgba(0, 255, 255, 0.5)')}>ACTIVE LOBBY: {currentLobby.name}</h2>
          
          {/* LOBBY CODE */}
          <div style={{ color: "#ff0080", textShadow: "0 0 15px rgba(255, 0, 128, 0.6)", marginBottom: "30px",
                        fontSize: "1.5rem", background: "rgba(0, 0, 0, 0.5)", padding: "20px 30px", borderRadius: "15px",
                        border: "3px solid rgba(255, 0, 128, 0.4)", display: "inline-block", 
                        boxShadow: "0 0 30px rgba(255, 0, 128, 0.3)" }}>
            🎯 LOBBY CODE: <strong style={{fontSize: "2rem", color: "#ff00ff"}}>{currentLobby.id}</strong>
          </div>
          
          {/* Players List */}
          <div style={{ marginBottom: "40px" }}>
            <h3 style={cyberpunkText('#ff0080', '1.5rem', '0 0 10px rgba(255, 0, 128, 0.5)')}>
              COMBATANTS ({currentLobby.players.length}/{currentLobby.maxPlayers})
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" }}>
              {currentLobby.players.map((p) => (
                <div key={p.id} style={{ padding: "20px", background: "rgba(0, 0, 0, 0.4)", borderRadius: "12px", 
                                        border: "2px solid rgba(0, 255, 255, 0.2)", textAlign: "center" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: p.color, 
                                border: "2px solid #00ffff", margin: "0 auto 10px", boxShadow: "0 0 15px rgba(0, 255, 255, 0.3)" }} />
                  <span style={{ color: "#00ffff", display: "block" }}>{p.name}</span>
                  {p.id === player?.id && <span style={{ color: "#ff0080", fontSize: "0.9em" }}>(YOU)</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "center" }}>
            {currentLobby.players[0]?.id === player?.id && (
              <button onClick={handleStartGame} style={cyberpunkButton('linear-gradient(45deg, #00ffff, #00ff88)', 'black')}>
                🚀 INITIATE COMBAT
              </button>
            )}
            <button onClick={() => window.location.reload()} style={cyberpunkButton('linear-gradient(45deg, #ff6b6b, #c44569)', 'white')}>
              ← ABORT MISSION
            </button>
          </div>
        </div>
      ) : (
        /* Lobby Creation/Join View */
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px", marginBottom: "40px" }}>
            
            {/* Create Lobby */}
            <div style={cyberpunkCard()}>
              <h3 style={cyberpunkText('#00ff88', '1.4rem', '0 0 10px rgba(0, 255, 136, 0.5)')}>CREATE NEW BATTLE ZONE</h3>
              <input type="text" placeholder="ENTER LOBBY NAME" value={lobbyName} onChange={(e) => setLobbyName(e.target.value)}
                     style={{ width: "100%", padding: "15px", border: "2px solid rgba(0, 255, 255, 0.3)", borderRadius: "10px",
                             background: "rgba(0, 0, 0, 0.6)", color: "#00ffff", fontSize: "1rem", marginBottom: "20px", textAlign: "center" }} />
              <button onClick={handleCreateLobby} style={cyberpunkButton('linear-gradient(45deg, #00ffff, #00ff88)', 'black')}>
                🏠 CREATE BATTLE ZONE
              </button>
            </div>

            {/* Join Lobby */}
            <div style={cyberpunkCard()}>
              <h3 style={cyberpunkText('#00ff88', '1.4rem', '0 0 10px rgba(0, 255, 136, 0.5)')}>JOIN EXISTING BATTLE</h3>
              <input type="text" placeholder="ENTER ACCESS CODE" value={joinCode} onChange={(e) => setJoinCode(e.target.value)}
                     style={{ width: "100%", padding: "15px", border: "2px solid rgba(0, 255, 255, 0.3)", borderRadius: "10px",
                             background: "rgba(0, 0, 0, 0.6)", color: "#00ffff", fontSize: "1rem", marginBottom: "20px", textAlign: "center" }} />
              <button onClick={handleJoinLobby} style={cyberpunkButton('linear-gradient(45deg, #ff0080, #ff00ff)', 'white')}>
                🔗 JOIN BATTLE
              </button>
            </div>
          </div>

          {/* Available Lobbies */}
          <div>
            <h3 style={cyberpunkText('#00ff88', '1.8rem', '0 0 10px rgba(0, 255, 136, 0.5)')}>ACTIVE BATTLE ZONES</h3>
            
            {availableLobbies.length === 0 ? (
              <p style={{ color: "rgba(0, 255, 255, 0.7)", textAlign: "center", fontSize: "1.1rem", padding: "40px" }}>
                NO ACTIVE BATTLE ZONES DETECTED. CREATE ONE!
              </p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                {availableLobbies.map((lobby) => (
                  <div key={lobby.id} style={cyberpunkCard()}>
                    <h4 style={cyberpunkText('#00ffff', '1.3rem', '0 0 10px rgba(0, 255, 255, 0.5)')}>{lobby.name}</h4>
                    <p style={cyberpunkText('rgba(0, 255, 255, 0.8)', '1rem', 'none')}>👥 COMBATANTS: {lobby.players.length}/{lobby.maxPlayers}</p>
                    <p style={cyberpunkText('#ff0080', '1.2rem', '0 0 8px rgba(255, 0, 128, 0.5)')}>🔢 CODE: <strong style={{fontSize: "1.3rem", color: "#ff00ff"}}>{lobby.id}</strong></p>
                    
                    <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "center" }}>
                      <button onClick={() => joinLobby(lobby.id)} disabled={lobby.players.length >= lobby.maxPlayers}
                              style={{ ...cyberpunkButton(lobby.players.length >= lobby.maxPlayers ? 
                                'rgba(255, 107, 107, 0.3)' : 'linear-gradient(45deg, #ff0080, #ff00ff)', 'white'),
                                padding: "12px 20px", opacity: lobby.players.length >= lobby.maxPlayers ? 0.6 : 1,
                                cursor: lobby.players.length >= lobby.maxPlayers ? "not-allowed" : "pointer" }}>
                        JOIN
                      </button>
                      <button onClick={() => spectateLobby(lobby.id)} 
                              style={{ ...cyberpunkButton('linear-gradient(45deg, #ff00ff, #ff0080)', 'white'), padding: "12px 20px" }}>
                        👁️ SPECTATE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: "#ff6b6b", background: "rgba(255, 107, 107, 0.1)", padding: "15px", borderRadius: "10px",
                      margin: "20px 0", borderLeft: "4px solid #ff6b6b", textAlign: "center" }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default LobbyScreen;