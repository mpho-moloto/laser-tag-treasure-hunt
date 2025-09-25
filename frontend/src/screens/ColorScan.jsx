import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ColorScan() {
  const videoRef = useRef(null);
  const [playerTag, setPlayerTag] = useState('');
  const [scannedColor, setScannedColor] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // FIXED: This was the error
  const location = useLocation();
  const arenaCode = location.state?.arenaCode || '';

  useEffect(() => {
    initializeScanner();
  }, []);

  const initializeScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Scanner init failed:', err);
    }
  };

  const captureColorData = () => {
    if (!playerTag.trim()) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const samplePoints = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        samplePoints.push({
          x: centerX + (x * 40),
          y: centerY + (y * 40)
        });
      }
    }

    const colors = samplePoints.map(point => {
      const pixel = ctx.getImageData(point.x, point.y, 1, 1).data;
      return rgbToHex(pixel[0], pixel[1], pixel[2]);
    });

    const colorCount = {};
    colors.forEach(color => {
      colorCount[color] = (colorCount[color] || 0) + 1;
    });

    let mostCommonColor = '#000000';
    let maxCount = 0;
    
    for (const [color, count] of Object.entries(colorCount)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonColor = color;
      }
    }

    const simpleColor = hexToSimpleColor(mostCommonColor);
    setScannedColor(simpleColor);
  };

  const rescanColor = () => {
    setScannedColor('');
    setError('');
  };

  const confirmColor = () => {
    navigate('/lobby', { // FIXED: Now using the correct 'navigate' function
      state: { 
        playerTag: playerTag, 
        arenaCode: arenaCode, 
        teamColor: scannedColor 
      }
    });
  };

  const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

  const hexToSimpleColor = (hex) => {
    const hexColor = hex.replace('#', '');
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);

    const colorMap = [
      { name: 'red', values: [255, 0, 0] },
      { name: 'blue', values: [0, 0, 255] },
      { name: 'green', values: [0, 255, 0] },
      { name: 'yellow', values: [255, 255, 0] },
      { name: 'purple', values: [128, 0, 128] },
      { name: 'orange', values: [255, 165, 0] }
    ];

    let closestColor = 'red';
    let minDistance = Infinity;

    colorMap.forEach(({ name, values: [cr, cg, cb] }) => {
      const distance = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2);
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = name;
      }
    });

    return closestColor;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>COLOR SCAN</h1>
      
      <div style={styles.cameraBox}>
        <video ref={videoRef} autoPlay muted style={styles.cameraVideo} />
        <div style={styles.scanGrid}>
          {[...Array(3)].map((_, i) => (
            [...Array(3)].map((_, j) => (
              <div 
                key={`${i}-${j}`}
                style={{
                  ...styles.gridPoint,
                  left: `calc(50% + ${(j - 1) * 40}px)`,
                  top: `calc(50% + ${(i - 1) * 40}px)`
                }}
              />
            ))
          ))}
        </div>
      </div>

      <div style={styles.controls}>
        <input
          type="text"
          value={playerTag}
          onChange={(e) => setPlayerTag(e.target.value.substring(0, 6))}
          placeholder="ENTER PLAYER NAME"
          style={styles.input}
        />
        
        {!scannedColor ? (
          <button onClick={captureColorData} style={styles.button}>
            📷 SCAN COLOR
          </button>
        ) : (
          <div style={styles.resultActions}>
            <button onClick={rescanColor} style={styles.secondaryButton}>
              🔄 RESCAN
            </button>
            <button onClick={confirmColor} style={styles.button}>
              ✅ CONFIRM
            </button>
          </div>
        )}
      </div>

      {scannedColor && (
        <div style={{...styles.result, background: scannedColor}}>
          DETECTED: {scannedColor.toUpperCase()}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: '#0a0a0a',
    minHeight: '100vh',
    color: 'white',
    padding: '20px',
    textAlign: 'center',
    fontFamily: 'Arial'
  },
  title: {
    color: '#0ff',
    textShadow: '0 0 10px #0ff',
    fontSize: '2rem',
    marginBottom: '20px'
  },
  cameraBox: {
    position: 'relative',
    display: 'inline-block',
    margin: '20px'
  },
  cameraVideo: {
    width: '300px',
    height: '400px',
    border: '2px solid #0ff',
    borderRadius: '10px',
    boxShadow: '0 0 20px #0ff'
  },
  scanGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  gridPoint: {
    position: 'absolute',
    width: '10px',
    height: '10px',
    background: '#0ff',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 0 10px #0ff'
  },
  controls: {
    margin: '20px'
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    border: '2px solid #0ff',
    background: '#111',
    color: 'white',
    borderRadius: '5px',
    margin: '10px',
    textAlign: 'center',
    boxShadow: '0 0 10px #0ff'
  },
  button: {
    padding: '10px 20px',
    background: '#0ff',
    color: '#000',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    margin: '5px',
    cursor: 'pointer',
    boxShadow: '0 0 10px #0ff'
  },
  secondaryButton: {
    padding: '10px 20px',
    background: '#333',
    color: '#0ff',
    border: '2px solid #0ff',
    borderRadius: '5px',
    fontSize: '16px',
    margin: '5px',
    cursor: 'pointer',
    boxShadow: '0 0 10px #0ff'
  },
  result: {
    padding: '15px',
    borderRadius: '5px',
    margin: '10px',
    color: 'black',
    fontWeight: 'bold',
    display: 'inline-block'
  },
  resultActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px'
  }
};