// src/styles/styles.js
export const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  mainCard: {
    maxWidth: '1200px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    overflow: 'hidden'
  },
  header: {
    // Richer, "Engineering" Academic Gradient (Deep Blue to Cyan to Violet)
    background: 'linear-gradient(-45deg, #020024, #090979, #00d4ff, #005bea)',
    backgroundSize: '400% 400%',
    padding: '4.5rem 2rem', // Increased vertical whitespace
    color: 'white',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    // Smoother, slower animation
    animation: 'gradientMove 15s ease infinite',
    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    zIndex: 10
  },

  title: {
    margin: 0,
    // Responsive font size using clamp
    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
    fontWeight: '800',
    letterSpacing: '-0.03em', // Tight modern tracking
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    // Refined "Liquid Metal" Shine Effect
    background: 'linear-gradient(to right, #ffffff 20%, #a5f3fc 40%, #ffffff 60%, #ffffff 100%)',
    backgroundSize: '200% auto',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
    // Glow matching the shine color
    textShadow: '0 0 40px rgba(165, 243, 252, 0.3)',
    animation: 'shine 4s linear infinite',
    display: 'inline-block'
  },

  subtitle: {
    margin: '0.75rem 0 0 0',
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#e0f7fa',
    opacity: 0.95,
    textShadow: '0 0 10px rgba(255,255,255,0.5)',
    letterSpacing: '0.3px'
  },
  tabContainer: {
    display: 'flex',
    background: '#f8f9fa',
    borderBottom: '2px solid #e9ecef',
    padding: '0 2rem'
  },
  tab: (active) => ({
    flex: 1,
    padding: '1.2rem 2rem',
    border: 'none',
    background: active ? 'white' : 'transparent',
    color: active ? '#667eea' : '#6c757d',
    fontWeight: active ? '600' : '500',
    fontSize: '1rem',
    cursor: 'pointer',
    borderBottom: active ? '3px solid #667eea' : 'none',
    transition: 'all 0.3s ease',
    transform: active ? 'translateY(2px)' : 'none'
  }),
  content: {
    padding: '2.5rem'
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '1.5rem',
    marginTop: 0
  },
  card: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    border: '1px solid #e9ecef'
  },
  inputGroup: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  select: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '2px solid #e9ecef',
    fontSize: '0.95rem',
    flex: '1',
    minWidth: '150px',
    background: 'white',
    cursor: 'pointer',
    transition: 'border-color 0.3s ease'
  },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '2px solid #e9ecef',
    fontSize: '0.95rem',
    flex: '1',
    minWidth: '150px',
    transition: 'border-color 0.3s ease'
  },
  button: (variant = 'primary') => ({
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: variant === 'primary' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
      variant === 'danger' ? '#dc3545' : '#6c757d',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  }),
  resultCard: {
    marginTop: '1.5rem',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
    borderRadius: '12px',
    border: '2px solid #4dd0e1'
  },
  resultTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#00695c',
    marginTop: 0,
    marginBottom: '1rem'
  },
  pathDisplay: {
    fontSize: '1.1rem',
    color: '#004d40',
    marginBottom: '0.75rem',
    fontWeight: '500'
  },
  locationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '0.75rem',
    marginTop: '1rem'
  },
  locationChip: {
    padding: '0.6rem 1rem',
    background: 'white',
    border: '2px solid #667eea',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#667eea',
    textAlign: 'center'
  },
  adminSection: {
    marginBottom: '2rem',
    padding: '1.5rem',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e9ecef'
  },
  adminTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#495057',
    marginTop: 0,
    marginBottom: '1rem',
    textAlign: 'center',
  },
  codeBlock: {
    background: '#282c34',
    color: '#61dafb',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    maxHeight: '300px',
    overflow: 'auto',
    fontFamily: 'Monaco, Consolas, "Courier New", monospace'
  },
  footer: {
    background: '#f8f9fa',
    padding: '1.5rem',
    textAlign: 'center',
    color: '#6c757d',
    borderTop: '1px solid #e9ecef',
    fontSize: '0.9rem'
  },
  gpsForm: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  },
  editForm: {
    background: '#e7f3ff',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '2px solid #3B82F6'
  },
  // src/styles/styles.js
  button: (variant = 'default') => {
    const variants = {
      primary: { backgroundColor: '#3b82f6', color: '#fff' },
      success: { backgroundColor: '#10b981', color: '#fff' },
      danger: { backgroundColor: '#dc2626', color: '#fff' },
      default: { backgroundColor: '#e5e7eb', color: '#1f2937' }
    };
    return {
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontWeight: 600,
      ...variants[variant]
    };
  }
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
@keyframes shine {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;
document.head.appendChild(styleSheet);
