import React from 'react';

export default function ShopPanel({ items, onPurchase, onClose, playerPoints }) {
    return (
        <div className="shop-overlay">
            <div className="shop-panel">
                <div className="shop-header">
                    <h2>ARMORY STORE</h2>
                    <button className="close-shop" onClick={onClose}>✕</button>
                </div>
                
                <div className="points-display">
                    <span className="points-label">AVAILABLE POINTS:</span>
                    <span className="points-value">{playerPoints}</span>
                </div>
                
                <div className="shop-items">
                    {Object.entries(items).map(([itemType, itemData]) => {
                        const canAfford = playerPoints >= itemData.cost;
                        
                        return (
                            <div key={itemType} className="shop-item">
                                <div className="item-info">
                                    <div className="item-icon">
                                        {itemType === 'pistol' && '🔫'}
                                        {itemType === 'rifle' && '🔍'}
                                        {itemType === 'shotgun' && '💥'}
                                    </div>
                                    <div className="item-details">
                                        <h3>{itemData.name}</h3>
                                        <p>Damage: {itemData.damage} | Ammo: {itemData.ammo}</p>
                                        <p className="item-desc">{itemData.description}</p>
                                    </div>
                                </div>
                                
                                <div className="item-purchase">
                                    <span className="item-price">${itemData.cost}</span>
                                    <button
                                        className={`buy-btn ${canAfford ? 'affordable' : 'expensive'}`}
                                        onClick={() => canAfford && onPurchase(itemType)}
                                        disabled={!canAfford}
                                    >
                                        {canAfford ? 'PURCHASE' : 'NEED POINTS'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="powerups-section">
                    <h3>POWER-UPS</h3>
                    <div className="powerup-item">
                        <span>Double Damage (15s) - $200</span>
                        <button className="buy-btn">BUY</button>
                    </div>
                    <div className="powerup-item">
                        <span>Extra Life - $150</span>
                        <button className="buy-btn">BUY</button>
                    </div>
                </div>
            </div>
        </div>
    );
}