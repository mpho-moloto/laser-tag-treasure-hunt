/* Student Number: 2023094242*/
/* Student Number: 2019042973*/

const ScoreBoardStyles = {
  container: {
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
    minHeight: '100vh',
    color: '#0ff',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    fontSize: '2.5rem',
    color: '#00f3ff',
    textShadow: '0 0 15px #00f3ff'
  },
  winnerSection: {
    marginTop: '10px',
    padding: '15px',
    background: 'rgba(0, 255, 255, 0.05)',
    borderRadius: '10px',
    display: 'inline-block'
  },
  winnerLabel: {
    fontSize: '1rem',
    opacity: 0.8
  },
  winnerName: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '5px 0',
    textShadow: '0 0 10px #0ff'
  },
  winCondition: {
    fontSize: '1rem',
    opacity: 0.7
  },
  youWon: {
    marginTop: '5px',
    fontSize: '1rem',
    color: '#00ff00',
    fontWeight: 'bold'
  },
  arenaInfo: {
    marginTop: '10px',
    fontSize: '0.9rem',
    color: '#ff0'
  },
  tableSection: {
    width: '100%',
    maxWidth: '900px',
    marginTop: '20px',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 0 20px #00f3ff'
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr 1fr',
    background: '#111',
    padding: '10px',
    fontWeight: 'bold',
    borderBottom: '2px solid #0ff'
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr 1fr',
    padding: '10px',
    borderBottom: '1px solid #0ff',
    transition: '0.3s',
    background: 'rgba(0, 255, 255, 0.05)'
  },
  winnerRow: {
    background: 'rgba(0, 255, 0, 0.2)',
    boxShadow: '0 0 15px #0f0'
  },
  yourRow: {
    border: '2px solid #ff0',
    boxShadow: '0 0 15px #ff0'
  },
  podium1: {
    background: 'rgba(255, 215, 0, 0.2)'
  },
  podium2: {
    background: 'rgba(192, 192, 192, 0.2)'
  },
  podium3: {
    background: 'rgba(205, 127, 50, 0.2)'
  },
  rank: {
    fontWeight: 'bold'
  },
  playerName: {
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center'
  },
  youIndicator: {
    fontSize: '0.8rem',
    marginLeft: '3px',
    color: '#0ff'
  },
  score: {
    fontWeight: 'bold'
  },
  summarySection: {
    marginTop: '20px',
    display: 'flex',
    gap: '30px'
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px',
    background: 'rgba(0,255,255,0.05)',
    borderRadius: '8px',
    minWidth: '100px'
  },
  actions: {
    marginTop: '30px',
    display: 'flex',
    gap: '20px'
  },
  homeBtn: {
    padding: '12px 25px',
    background: '#ff4444',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 0 15px #ff4444'
  },
  rematchBtn: {
    padding: '12px 25px',
    background: '#0ff',
    border: 'none',
    borderRadius: '8px',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 0 15px #0ff'
  },
  loading: {
    textAlign: 'center',
    marginTop: '50px'
  }
};

export default ScoreBoardStyles;
