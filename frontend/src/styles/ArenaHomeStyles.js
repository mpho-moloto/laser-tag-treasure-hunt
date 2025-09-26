// Student Number: 2023094242
// Student Number: 2019042973

const ArenaHomeStyles = {
  container: {
    background: 'linear-gradient(135deg, #0a0a0a 0%, #111122 100%)',
    minHeight: '100vh',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Arial, sans-serif'
  },
  titleSection: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  mainTitle: {
    color: '#00f3ff',
    textShadow: '0 0 25px #00f3ff, 0 0 50px #00f3ff',
    fontSize: '4rem',
    marginBottom: '10px'
  },
  tagline: {
    color: '#66f',
    fontSize: '1.2rem'
  },
  accessPanel: {
    background: 'rgba(0, 0, 0, 0.7)',
    border: '2px solid #00f3ff',
    borderRadius: '15px',
    padding: '30px',
    textAlign: 'center',
    boxShadow: '0 0 30px rgba(0, 243, 255, 0.5)',
    minWidth: '300px'
  },
  panelTitle: {
    color: '#00f3ff',
    marginBottom: '20px',
    fontSize: '1.5rem'
  },
  codeInput: {
    padding: '15px',
    fontSize: '1.5rem',
    border: '2px solid #00f3ff',
    background: '#111',
    color: '#0ff',
    borderRadius: '10px',
    margin: '10px 0',
    textAlign: 'center',
    width: '200px',
    textTransform: 'uppercase',
    boxShadow: '0 0 10px #00f3ff inset'
  },
  entryButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '20px'
  },
  fighterBtn: {
    padding: '15px 30px',
    background: 'linear-gradient(45deg, #ff0055, #ff4444)',
    color: '#fff',
    border: 'none',
    borderRadius: '25px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 0 25px #ff0055, 0 0 50px #ff4444',
    transition: 'all 0.3s ease'
  },
  watcherBtn: {
    padding: '15px 30px',
    background: 'linear-gradient(45deg, #00f3ff, #0099cc)',
    color: '#000',
    border: 'none',
    borderRadius: '25px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 0 25px #00f3ff, 0 0 50px #0099cc',
    transition: 'all 0.3s ease'
  },
  footer: {
    marginTop: '40px',
    color: '#66f',
    textAlign: 'center'
  }
};

export default ArenaHomeStyles;
