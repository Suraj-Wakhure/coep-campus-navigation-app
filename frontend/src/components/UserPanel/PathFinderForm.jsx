// src/components/UserPanel/PathFinderForm.jsx
import { useState, useMemo } from 'react';
import { styles } from '../../styles/styles';

export default function PathFinderForm({
  source,
  setSource,
  destination,
  setDestination,
  locations,
  loading,
  handleFind
}) {
  const [sourceQuery, setSourceQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [sourceOpen, setSourceOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);

  // Filter source options (exclude selected destination)
  const sourceOptions = useMemo(() => {
    const q = sourceQuery.trim().toLowerCase();
    return locations.filter(loc => {
      const matches = loc.toLowerCase().includes(q);
      const notDestination = loc !== destination;
      return matches && notDestination;
    });
  }, [locations, sourceQuery, destination]);

  // Filter destination options (exclude selected source)
  const destOptions = useMemo(() => {
    const q = destQuery.trim().toLowerCase();
    return locations.filter(loc => {
      const matches = loc.toLowerCase().includes(q);
      const notSource = loc !== source;
      return matches && notSource;
    });
  }, [locations, destQuery, source]);

  return (
    <div style={styles.card}>
      <div style={styles.inputGroup}>
        {/* === SOURCE SEARCH === */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={sourceQuery}
            onChange={e => setSourceQuery(e.target.value)}
            onFocus={() => setSourceOpen(true)}
            onBlur={() => setTimeout(() => setSourceOpen(false), 200)}
            placeholder="Search source..."
            style={{
              ...styles.select,
              paddingRight: '2.5rem',
              cursor: 'text'
            }}
          />
          {source && (
            <button
              onClick={() => {
                setSource('');
                setSourceQuery('');
              }}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              x
            </button>
          )}
          {sourceOpen && sourceOptions.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 10,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}
            >
              {sourceOptions.map(loc => (
                <div
                  key={loc}
                  onMouseDown={() => {
                    setSource(loc);
                    setSourceQuery(loc);
                    setSourceOpen(false);
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    background: source === loc ? '#dbeafe' : 'transparent'
                  }}
                >
                  {loc}
                </div>
              ))}
            </div>
          )}
        </div>
          to
        {/* === DESTINATION SEARCH === */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={destQuery}
            onChange={e => setDestQuery(e.target.value)}
            onFocus={() => setDestOpen(true)}
            onBlur={() => setTimeout(() => setDestOpen(false), 200)}
            placeholder="Search destination..."
            style={{
              ...styles.select,
              paddingRight: '2.5rem',
              cursor: 'text'
            }}
          />
          {destination && (
            <button
              onClick={() => {
                setDestination('');
                setDestQuery('');
              }}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              x
            </button>
          )}
          {destOpen && destOptions.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 10,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}
            >
              {destOptions.map(loc => (
                <div
                  key={loc}
                  onMouseDown={() => {
                    setDestination(loc);
                    setDestQuery(loc);
                    setDestOpen(false);
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    background: destination === loc ? '#dbeafe' : 'transparent'
                  }}
                >
                  {loc}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === FIND BUTTON === */}
        <button
          onClick={handleFind}
          disabled={loading || !source || !destination}
          style={styles.button('primary')}
        >
          {loading ? 'Finding...' : 'Find Path'}
        </button>
      </div>
    </div>
  );
}