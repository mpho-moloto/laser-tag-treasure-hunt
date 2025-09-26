// Student Number: 2023094242
// Student Number: 2019042973

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/ColorScanStyles';

export default function ColorScan() {
  // useRef: Attaches to the <video> element to access its stream.
  const videoRef = useRef(null);
  const [playerTag, setPlayerTag] = useState('');
  // Stores the final, simplified color detected (e.g., 'red').
  const [scannedColor, setScannedColor] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const arenaCode = location.state?.arenaCode || '';

  // useEffect: Initializes the camera stream on component mount.
  useEffect(() => {
    initializeScanner();
  }, []);

  /** Initializes the video stream using the Web MediaDevices API. */
  const initializeScanner = async () => {
    try {
      // Request video access.
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      // Attach the stream to the video element.
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Scanner init failed:', err);
    }
  };

  /** Captures a frame, samples colors, and determines the most common simple color. */
  const captureColorData = () => {
    if (!playerTag.trim()) return;

    // Create a temporary canvas to draw the video frame for pixel analysis.
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    // Draw the current video frame onto the canvas.
    ctx.drawImage(video, 0, 0);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Define 9 sample points in a 3x3 grid centered on the screen, 40px apart.
    const samplePoints = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        samplePoints.push({ x: centerX + x * 40, y: centerY + y * 40 });
      }
    }

    // Map sample points to their Hex color codes.
    const colors = samplePoints.map(point => {
      // Get RGBA data for a single pixel.
      const pixel = ctx.getImageData(point.x, point.y, 1, 1).data;
      return rgbToHex(pixel[0], pixel[1], pixel[2]);
    });

    // Tally the occurrences of each hex color to find the majority color (simplifies noise).
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

    // Convert the exact hex color to a simple, predefined color name.
    const simpleColor = hexToSimpleColor(mostCommonColor);
    setScannedColor(simpleColor);
  };

  const rescanColor = () => {
    setScannedColor('');
    setError('');
  };

  /** Navigates to the lobby, passing player data and the final team color. */
  const confirmColor = () => {
    navigate('/lobby', {
      state: { playerTag: playerTag, arenaCode: arenaCode, Color: scannedColor }
    });
  };

  /** Converts RGB values to a Hex color string (e.g., #ff0000). */
  const rgbToHex = (r, g, b) =>
    '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

  /**
   * Finds the closest simple color from a map using Euclidean distance
   * in the RGB color space. This is the core logic for color categorization.
   */
  const hexToSimpleColor = hex => {
    const hexColor = hex.replace('#', '');
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);

    // Predefined simple colors to categorize against.
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

    // Calculate the distance to each simple color to find the best match.
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
        {/* Render the 3x3 grid overlay corresponding to the samplePoints positions. */}
        <div style={styles.scanGrid}>
          {[...Array(3)].map((_, i) =>
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
          )}
        </div>
      </div>

      <div style={styles.controls}>
        {/* Input is restricted to 6 characters. */}
        <input
          type="text"
          value={playerTag}
          onChange={e => setPlayerTag(e.target.value.substring(0, 6))}
          placeholder="ENTER PLAYER NAME"
          style={styles.input}
        />

        {/* Conditional button rendering based on whether a color has been scanned. */}
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

      {/* Display the result, using the scannedColor as the background color. */}
      {scannedColor && (
        <div style={{ ...styles.result, background: scannedColor }}>
          DETECTED: {scannedColor.toUpperCase()}
        </div>
      )}
    </div>
  );
}