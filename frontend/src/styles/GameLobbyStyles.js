// Student Number: 2023094242
// Student Number: 2019042973

// GameLobbyStyles.js
const colors = {
  primary: '#00f3ff',
  secondary: '#1a1a2e',
  success: '#00ff00',
  warning: '#ffaa00',
  danger: '#ff4444',
  gold: '#FFD700',
  background: '#0a0a0a',
  text: '#ffffff'
};

const GameLobbyStyles = {
  colors,

  container: {
    background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.secondary} 100%)`,
    minHeight: '100vh',
    color: colors.text,
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },

  header: { textAlign: 'center', marginBottom: '30px' },
  title: { color: colors.primary, textShadow: `0 0 10px ${colors.primary}`, fontSize: '2.5rem', marginBottom: '20px' },
  infoPanel: { background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '10px', display: 'inline-block', textAlign: 'left' },
  infoItem: { margin: '5px 0', fontSize: '14px' },

  playersSection: { textAlign: 'center', marginBottom: '30px' },
  sectionTitle: { color: colors.primary, marginBottom: '20px' },
  playersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', maxWidth: '800px', margin: '0 auto' },
  playerCard: { padding: '15px', border: '2px solid', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s ease' },
  playerInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  playerName: { fontWeight: 'bold', fontSize: '16px' },
  crown: { fontSize: '0.9rem', background: colors.gold, color: '#000', borderRadius: '3px', padding: '2px 4px', marginLeft: '5px' },
  colorSwatch: { width: '20px', height: '20px', borderRadius: '50%', border: '2px solid white' },
  emptyState: { padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', margin: '20px auto', maxWidth: '400px' },

  controls: { textAlign: 'center', marginBottom: '20px' },
  startButton: { padding: '15px 30px', background: `linear-gradient(45deg, ${colors.success}, #00cc00)`, color: '#000', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', margin: '10px', boxShadow: `0 0 20px ${colors.success}` },
  hostNote: { fontSize: '14px', opacity: 0.8, marginTop: '5px' },
  waitingMessage: { padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', margin: '20px auto', maxWidth: '400px' },
  loadingSpinner: { width: '30px', height: '30px', border: '3px solid #333', borderTop: `3px solid ${colors.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' },
  hostName: { color: colors.primary, fontWeight: 'bold' },
  exitButton: { padding: '10px 20px', background: colors.danger, color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '10px', fontSize: '14px' },

  errorBox: { background: 'rgba(255, 0, 0, 0.2)', padding: '15px', borderRadius: '10px', textAlign: 'center', margin: '20px 0', border: `1px solid ${colors.danger}` },
  retryButton: { padding: '8px 16px', background: colors.danger, color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' },

  debugPanel: { background: 'rgba(0, 0, 0, 0.5)', padding: '10px', borderRadius: '5px', marginTop: '20px', fontSize: '12px' },
  debugText: { margin: 0, fontSize: '10px' }
};

// Spinner animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`, styleSheet.cssRules.length);

export default GameLobbyStyles;
