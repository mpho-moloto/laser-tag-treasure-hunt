// Student Number: 2023094242
// Student Number: 2019042973

import React from 'react';

export default function ArenaHUD({ onFire, ammunition, isReloading }) {
    return (
        <div className="hud-section">
            <div className="fire-control">
                <button 
                    className={`fire-btn ${isReloading ? 'reloading' : ''}`}
                    onClick={onFire} // Fire weapon when clicked
                    disabled={isReloading || ammunition <= 0} // Disable if reloading or out of ammo
                >
                    <span className="btn-icon">🎯</span>
                    <span className="btn-text">OPEN FIRE</span>
                    <span className="ammo-count">{ammunition}</span> {/* Display current ammo count */}
                </button>
                
                {isReloading && ( // Show reload indicator only when reloading
                    <div className="reload-indicator">
                        <div className="reload-bar"></div>
                        <span>RELOADING...</span>
                    </div>
                )}
            </div>
            
            <div className="combat-stats">
                <div className="stat-item">
                    <span className="stat-label">AMMO</span>
                    <span className="stat-value">{ammunition}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">STATUS</span>
                    <span className="stat-value">
                        {isReloading ? 'RELOADING' : 'READY'} {/* Dynamic status text */}
                    </span>
                </div>
            </div>
        </div>
    );
}