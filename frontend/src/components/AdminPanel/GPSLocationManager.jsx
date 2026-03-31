// src/components/AdminPanel/GPSLocationManager.jsx
import { styles } from '../../styles/styles';
import { useState, useMemo } from 'react';

export default function GPSLocationManager({
  gpsLocations,
  openEditModal,
  openDeleteModal
}) {
  const [query, setQuery] = useState('');

  // Filter by location name
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return gpsLocations;
    return gpsLocations.filter(loc =>
      loc.name.toLowerCase().includes(q)
    );
  }, [gpsLocations, query]);

  return (
    <div style={styles.adminSection}>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={styles.adminTitle}>GPS Locations ({gpsLocations.length})</h4>
        <input
          type="text"
          placeholder="Search locations..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            padding: '0.55rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'border 0.2s ease',
            width: '240px',
          }}
          onFocus={(e) => (e.target.style.border = '1px solid #3b82f6')}
          onBlur={(e) => (e.target.style.border = '1px solid #e9ecef')}
        />
      </div>

      {/* Table */}
      <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Campus</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
                  No locations match "{query}"
                </td>
              </tr>
            ) : (
              filtered.map(coord => (
                <tr key={coord.id || coord.name} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tdStyle}>{coord.name}</td>

                  {/* ---------- CAMPUS BADGE (fixed) ---------- */}
                  <td style={tdStyle}>
                    <span
                      style={{
                        ...campusBadge,
                        background: coord.campus_type === 'North' ? '#667eea' : '#764ba2',
                        color: 'white',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        display: 'inline-block',
                        minWidth: '60px',
                        textAlign: 'center'
                      }}
                    >
                      {coord.campus_type || '—'}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <button onClick={() => openEditModal(coord)} style={editBtnStyle}>
                      Edit
                    </button>{' '}
                    <button onClick={() => openDeleteModal(coord)} style={deleteBtnStyle}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Styles (unchanged) ---------- */
const thStyle = { padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e9ecef' };
const tdStyle = { padding: '0.75rem' };
const campusBadge = {
  padding: '0.25rem 0.6rem',
  borderRadius: '6px',
  fontSize: '0.8rem',
  fontWeight: '600',
  color: 'white'
};
const editBtnStyle = {
  padding: '0.4rem 0.8rem',
  background: '#3B82F6',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.8rem'
};
const deleteBtnStyle = {
  padding: '0.4rem 0.8rem',
  background: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.8rem'
};