import React from 'react';

export default function ArenaHUD({ onFire, ammunition, isReloading }) {
    return (
        <div className="hud-section">
            <div className="fire-control">
                <button 
                    className={`fire-btn ${isReloading ? 'reloading' : ''}`}
                    onClick={onFire}
                    disabled={isReloading || ammunition <= 0}
                >
                    <span className="btn-icon">🎯</span>
                    <span className="btn-text">OPEN FIRE</span>
                    <span className="ammo-count">{ammunition}</span>
                </button>
                
                {isReloading && (
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
                        {isReloading ? 'RELOADING' : 'READY'}
                    </span>
                </div>
            </div>
        </div>
    );
}