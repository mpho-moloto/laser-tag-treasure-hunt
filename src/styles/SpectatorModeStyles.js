/* Student Number: 2023094242*/
/* Student Number: 2019042973*/

// SpectatorModeStyles.js
const colors = {
  primary: '#00f3ff',
  secondary: '#1a1a2e',
  danger: '#ff4444',
  success: '#00ff00',
  warning: '#ffaa00',
  background: '#0a0a0a',
  text: '#ffffff'
};

const SpectatorModeStyles = {
  colors,

  container: {
    background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.secondary} 100%)`,
    minHeight: '100vh',
    color: colors.text,
    fontFamily: 'Arial, sans-serif'
  },

  header: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '20px',
    borderBottom: `2px solid ${colors.primary}`,
    textAlign: 'center'
  },

  title: {
    color: colors.primary,
    textShadow: `0 0 10px ${colors.primary}`,
    fontSize: '2.5rem',
    marginBottom: '15px'
  },

  gameInfo: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    flexWrap: 'wrap'
  },

  infoItem: {
    background: `rgba(0, 243, 255, 0.1)`,
    padding: '10px 20px',
    borderRadius: '20px',
    border: `1px solid ${colors.primary}`
  },

  content: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: 'calc(100vh - 200px)'
  },

  playerDetail: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '15px',
    padding: '30px',
    border: `2px solid ${colors.primary}`
  },

  backButton: {
    background: `rgba(0, 243, 255, 0.2)`,
    color: colors.primary,
    border: `1px solid ${colors.primary}`,
    padding: '10px 20px',
    borderRadius: '20px',
    cursor: 'pointer',
    marginBottom: '20px'
  },

  playerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '30px'
  },

  playerColor: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid white'
  },

  playerName: {
    fontSize: '2rem',
    margin: 0,
    color: colors.primary
  },

  eliminatedTag: {
    background: colors.danger,
    color: 'white',
    padding: '5px 10px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 'bold'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },

  statCard: {
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },

  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: '5px'
  },

  statLabel: {
    fontSize: '12px',
    color: '#888',
    textTransform: 'uppercase'
  },

  healthBar: {
    width: '100%',
    height: '10px',
    background: '#333',
    borderRadius: '5px',
    marginBottom: '10px'
  },

  weaponsSection: {
    marginTop: '30px'
  },

  sectionTitle: {
    color: colors.primary,
    borderBottom: `1px solid ${colors.primary}`,
    paddingBottom: '10px',
    marginBottom: '15px'
  },

  weaponsList: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap'
  },

  weaponItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },

  weaponImage: {
    width: '30px',
    height: '30px'
  },

  rankings: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '15px',
    padding: '30px',
    border: `2px solid ${colors.primary}`
  },

  rankingsTitle: {
    color: colors.primary,
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '1.8rem'
  },

  rankingsHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 3fr 1fr 1fr 1.5fr',
    gap: '15px',
    padding: '15px 20px',
    background: `rgba(0, 243, 255, 0.1)`,
    borderRadius: '8px',
    fontWeight: 'bold',
    marginBottom: '10px'
  },

  rankingsList: {
    maxHeight: '500px',
    overflowY: 'auto'
  },

  rankingItem: {
    display: 'grid',
    gridTemplateColumns: '1fr 3fr 1fr 1fr 1.5fr',
    gap: '15px',
    padding: '15px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },

  eliminatedItem: {
    opacity: 0.6,
    background: 'rgba(255, 0, 0, 0.1)'
  },

  rankNumber: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    textAlign: 'center'
  },

  playerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: 'bold'
  },

  colorDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%'
  },

  points: {
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'center'
  },

  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#888'
  },

  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px'
  },

  footer: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '20px',
    borderTop: `2px solid ${colors.primary}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  exitButton: {
    background: `linear-gradient(45deg, ${colors.danger}, #cc0000)`,
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '25px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },

  spectatorCount: {
    color: colors.primary,
    fontWeight: 'bold'
  },

  errorBanner: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: `rgba(255, 0, 0, 0.9)`,
    color: 'white',
    padding: '15px 25px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },

  retryButton: {
    background: 'white',
    color: colors.danger,
    border: 'none',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },

  error: {
    textAlign: 'center',
    fontSize: '1.5rem',
    color: colors.danger,
    padding: '50px'
  }
};

export default SpectatorModeStyles;
