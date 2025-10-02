// Student Number: 2023094242
// Student Number: 2019042973

// components/WeaponBar.jsx
import React from 'react';

export default function WeaponBar({ weapons, currentWeapon, onWeaponSelect, unlockedWeapons, disabled = false }) {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '15px', 
      alignItems: 'center',
      background: 'rgba(0, 243, 255, 0.1)',
      padding: '15px 25px',
      borderRadius: '15px',
      border: '2px solid #00f3ff',
      boxShadow: '0 0 20px rgba(0, 243, 255, 0.3)',
      height: '100px'
    }}>
      {/* Map through all available weapons */}
      {Object.entries(weapons).map(([key, weapon]) => {
        const isUnlocked = unlockedWeapons.includes(key); // Check if weapon is purchased
        const isCurrent = currentWeapon === key; // Check if this is active weapon
        
        return (
          <button
            key={key}
            onClick={() => !disabled && isUnlocked && onWeaponSelect(key)} // Only allow selection if not disabled and unlocked
            disabled={disabled || !isUnlocked}
            style={{
              padding: '15px',
              background: disabled ? '#222' : isCurrent ? 
                'linear-gradient(135deg, #00f3ff, #0099cc)' : // Highlight current weapon
                isUnlocked ? '#333' : '#222', // Different background for locked weapons
              color: disabled ? '#666' : isCurrent ? '#000' : isUnlocked ? '#fff' : '#666',
              border: `3px solid ${disabled ? '#444' : isCurrent ? '#00f3ff' : isUnlocked ? '#666' : '#444'}`,
              borderRadius: '12px',
              cursor: disabled || !isUnlocked ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              fontSize: '14px',
              fontWeight: 'bold',
              width: '120px',
              height: '80px',
              transition: 'all 0.3s ease',
              transform: isCurrent ? 'scale(1.05)' : 'scale(1)', // Scale up current weapon
              boxShadow: isCurrent ? '0 0 15px #00f3ff' : 'none', // Glow effect for current weapon
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={disabled ? 'Eliminated - Cannot switch' : !isUnlocked ? 'Locked - Purchase in Store' : weapon.name}
          >
            {/* Weapon icon image */}
            <img 
              src={`/images/${weapon.icon}`} 
              alt={weapon.name}
              style={{
                width: '40px',
                height: '40px',
                filter: isUnlocked ? 'none' : 'grayscale(100%) brightness(0.5)', // Gray out locked weapons
                marginBottom: '5px'
              }}
            />
            <div style={{ fontSize: '12px' }}>
              {weapon.name}
              {/* Show lock icon for locked weapons */}
              {!isUnlocked && <div style={{fontSize: '10px', color: '#ff4444'}}>🔒</div>}
            </div>
          </button>
        );
      })}
    </div>
  );
}