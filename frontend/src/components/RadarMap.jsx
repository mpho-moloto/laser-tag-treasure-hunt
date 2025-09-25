import React from 'react';

export default function RadarMap({ players = [] }) {
    const radarSize = 150;
    
    const getPlayerPosition = (player, index) => {
        // Simple circular positioning for demo
        const angle = (index / players.length) * 2 * Math.PI;
        const distance = radarSize * 0.35;
        
        return {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance
        };
    };

    return (
        <div className="radar-widget">
            <div className="radar-container">
                <div className="radar-title">TACTICAL RADAR</div>
                
                <div className="radar-dish" style={{ width: radarSize, height: radarSize }}>
                    {/* Radar grid */}
                    <div className="radar-grid">
                        <div className="grid-line horizontal"></div>
                        <div className="grid-line vertical"></div>
                        <div className="grid-circle outer"></div>
                        <div className="grid-circle middle"></div>
                        <div className="grid-circle inner"></div>
                    </div>
                    
                    {/* Player dots */}
                    {players.map((player, index) => {
                        const position = getPlayerPosition(player, index);
                        return (
                            <div
                                key={player.id || index}
                                className="player-dot"
                                style={{
                                    left: `calc(50% + ${position.x}px)`,
                                    top: `calc(50% + ${position.y}px)`,
                                    backgroundColor: player.color || '#ff4444'
                                }}
                                title={player.tag || `Player ${index + 1}`}
                            >
                                <div className="pulse-effect"></div>
                            </div>
                        );
                    })}
                    
                    {/* Scanning sweep */}
                    <div className="radar-sweep"></div>
                    
                    {/* Center point (player position) */}
                    <div className="radar-center"></div>
                </div>
                
                {/* Legend */}
                <div className="radar-legend">
                    {players.slice(0, 4).map((player, index) => (
                        <div key={index} className="legend-item">
                            <span 
                                className="color-indicator"
                                style={{ backgroundColor: player.color }}
                            ></span>
                            <span className="player-name">
                                {player.tag || `P${index + 1}`}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}