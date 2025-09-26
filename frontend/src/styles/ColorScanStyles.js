// Student Number: 2023094242
// Student Number: 2019042973

// ColorScanStyles.js
const ColorScanStyles = {
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

export default ColorScanStyles;
