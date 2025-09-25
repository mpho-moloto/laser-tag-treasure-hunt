import React from 'react';

export default function WeaponBar({ weapons, currentWeapon, onWeaponSelect, unlockedWeapons }) {
    return (
        <div className="weapon-bar">
            <div className="weapon-slots">
                {Object.entries(weapons).map(([weaponType, weaponData]) => {
                    const isUnlocked = unlockedWeapons.includes(weaponType);
                    const isActive = currentWeapon === weaponType;
                    
                    return (
                        <div
                            key={weaponType}
                            className={`weapon-slot ${isActive ? 'active' : ''} ${
                                isUnlocked ? 'unlocked' : 'locked'
                            }`}
                            onClick={() => isUnlocked && onWeaponSelect(weaponType)}
                            title={isUnlocked ? weaponData.name : `Locked - ${weaponData.cost} points`}
                        >
                            <div className="weapon-icon">
                                {weaponType === 'pistol' && '🔫'}
                                {weaponType === 'rifle' && '🔍'}
                                {weaponType === 'shotgun' && '💥'}
                            </div>
                            <div className="weapon-info">
                                <span className="weapon-name">
                                    {weaponType.toUpperCase()}
                                </span>
                                {!isUnlocked && (
                                    <span className="weapon-cost">${weaponData.cost}</span>
                                )}
                            </div>
                            {isActive && <div className="active-indicator"></div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}