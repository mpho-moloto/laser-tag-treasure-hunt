// Student Number: 2023094242
// Student Number: 2019042973

// components/ShopPanel.jsx
import React from 'react';

export default function ShopPanel({ onPurchase, onClose, playerPoints }) {
  // Define available shop items with their properties
  const shopItems = {
    rifle: { 
      name: "Assault Rifle", 
      cost: 100, 
      icon: "🔍", 
      description: "35 damage, 10 ammo capacity",
      type: "weapon"
    },
    shotgun: { 
      name: "Combat Shotgun", 
      cost: 200, 
      icon: "💥", 
      description: "50 damage, 6 ammo capacity",
      type: "weapon"
    },
    healthPack: { 
      name: "Health Pack", 
      cost: 80, 
      icon: "❤️", 
      description: "Restore health to full",
      type: "health"
    },
    doubleDamage: { 
      name: "Damage Boost", 
      cost: 150, 
      icon: "⚡", 
      description: "Double damage for 30 seconds",
      type: "powerup"
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)', // Center the panel
      background: 'rgba(10, 10, 20, 0.95)',
      border: '3px solid #00f3ff',
      borderRadius: '20px',
      padding: '30px',
      zIndex: 1000, // Ensure it appears above other elements
      minWidth: '450px',
      boxShadow: '0 0 50px rgba(0, 243, 255, 0.5)',
      backdropFilter: 'blur(10px)' // Glass effect
    }}>
      {/* Header with title and close button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        borderBottom: '2px solid #00f3ff',
        paddingBottom: '15px'
      }}>
        <h2 style={{ color: '#00f3ff', margin: 0, fontSize: '28px' }}>🛒 ARMORY STORE</h2>
        <button onClick={onClose} style={{
          background: 'none',
          border: '2px solid #00f3ff',
          color: '#00f3ff',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          cursor: 'pointer',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          ✕
        </button>
      </div>

      {/* Player points display */}
      <div style={{ 
        color: '#00f3ff', 
        marginBottom: '20px', 
        fontSize: '20px',
        textAlign: 'center',
        background: 'rgba(0, 243, 255, 0.1)',
        padding: '10px',
        borderRadius: '10px',
        border: '1px solid #00f3ff'
      }}>
        Battle Points: <span style={{color: '#fff', fontSize: '24px', fontWeight: 'bold'}}>{playerPoints}</span>
      </div>

      {/* Shop items list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {Object.entries(shopItems).map(([key, item]) => {
          const canAfford = playerPoints >= item.cost; // Check if player can afford item
          
          return (
            <button
              key={key}
              onClick={() => canAfford && onPurchase(key)} // Only allow purchase if affordable
              disabled={!canAfford}
              style={{
                padding: '20px',
                background: canAfford 
                  ? 'linear-gradient(135deg, #333, #555)' 
                  : 'linear-gradient(135deg, #222, #333)',
                color: canAfford ? '#fff' : '#666',
                border: `3px solid ${canAfford ? '#00f3ff' : '#444'}`,
                borderRadius: '12px',
                cursor: canAfford ? 'pointer' : 'not-allowed',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                opacity: canAfford ? 1 : 0.6
              }}
            >
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontSize: '20px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  {item.name}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>{item.description}</div>
              </div>
              <div style={{ 
                color: canAfford ? '#00f3ff' : '#666',
                fontSize: '18px',
                fontWeight: 'bold',
                background: canAfford ? 'rgba(0, 243, 255, 0.1)' : 'rgba(0,0,0,0.3)',
                padding: '8px 15px',
                borderRadius: '20px',
                border: `2px solid ${canAfford ? '#00f3ff' : '#444'}`,
                minWidth: '80px'
              }}>
                {item.cost} pts
              </div>
            </button>
          );
        })}
      </div>

      {/* Help tip */}
      <div style={{ 
        marginTop: '20px', 
        fontSize: '12px', 
        color: '#666', 
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        💡 Tip: Each successful hit earns 25 points. Eliminations earn bonus points!
      </div>
    </div>
  );
}