// Student Number: 2023094242
// Student Number: 2019042973

import React from 'react';

export default function RadarMap({ players, currentPlayer, gpsBounds }) {
  const mapSize = 180;

  // Filter to only show players with active GPS and not eliminated
  const gpsPlayers = players.filter(player => player.gpsAvailable && !player.isEliminated);
  const hasGpsPlayers = gpsPlayers.length > 0;

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.9)',
      border: '2px solid #00f3ff',
      borderRadius: '10px',
      padding: '10px',
      width: `${mapSize}px`,
      height: `${mapSize}px`,
      position: 'relative'
    }}>
      {/* Radar Background */}
      <div style={{
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, #001122 0%, #000811 100%)',
        border: '1px solid #00f3ff',
        borderRadius: '5px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Show overlay when no GPS players available */}
        {!hasGpsPlayers && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#ff4444',
            fontSize: '12px',
            fontWeight: 'bold',
            background: 'rgba(0,0,0,0.9)',
            padding: '15px',
            borderRadius: '5px',
            zIndex: 10,
            width: '90%'
          }}>
            ❌ GPS UNAVAILABLE
            <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.7 }}>
              Players will appear when GPS is active
            </div>
          </div>
        )}

        {/* Grid lines and radar effects - only visible when GPS active */}
        {hasGpsPlayers && (
          <>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              background: 'rgba(0, 243, 255, 0.2)'
            }}></div>
            <div style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '1px',
              background: 'rgba(0, 243, 255, 0.2)'
            }}></div>
            
            {/* Animated radar sweep line */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '2px',
              height: '100%',
              background: 'linear-gradient(to bottom, transparent, #00f3ff, transparent)',
              transformOrigin: 'center',
              animation: 'sweep 3s linear infinite',
              opacity: 0.5
            }}></div>
          </>
        )}

        {/* Render player positions on radar */}
        {gpsPlayers.map((player, index) => {
          const x = ((player.position?.x || 50) - 50) * (mapSize / 100); // Calculate X position
          const y = ((player.position?.y || 50) - 50) * (mapSize / 100); // Calculate Y position
          const isCurrent = player.tag === currentPlayer; // Check if this is the current player
          const size = isCurrent ? 12 : 8; // Larger dot for current player
          
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `calc(50% + ${x}px)`, // Position relative to center
                top: `calc(50% + ${y}px)`,
                width: `${size}px`,
                height: `${size}px`,
                background: player.color || '#fff',
                borderRadius: '50%',
                border: isCurrent ? '2px solid #00f3ff' : '2px solid #00ff00', // Highlight current player
                transform: 'translate(-50%, -50%)',
                boxShadow: isCurrent ? '0 0 10px #00f3ff, 0 0 20px #00f3ff' : '0 0 5px #00ff00',
                zIndex: isCurrent ? 2 : 1,
                transition: 'all 0.3s ease'
              }}
              title={`${player.tag}${isCurrent ? ' (YOU)' : ''}`} // Tooltip with player name
            />
          );
        })}

        {/* Center point marker */}
        {hasGpsPlayers && (
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '4px',
            height: '4px',
            background: '#00f3ff',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 5px #00f3ff'
          }}></div>
        )}

        {/* Bottom status indicator */}
        <div style={{
          position: 'absolute',
          bottom: '5px',
          left: '5px',
          fontSize: '8px',
          color: hasGpsPlayers ? '#00ff00' : '#ff4444',
          background: 'rgba(0,0,0,0.7)',
          padding: '2px 5px',
          borderRadius: '3px'
        }}>
          {hasGpsPlayers ? `📍 ${gpsPlayers.length} PLAYERS` : '❌ GPS OFFLINE'}
        </div>
      </div>

      {/* CSS animation for radar sweep */}
      <style>{`
        @keyframes sweep {
          0% { transform: translateX(-50%) rotate(0deg); }
          100% { transform: translateX(-50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}