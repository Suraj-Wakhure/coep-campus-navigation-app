// src/components/AdminPanel/ManagePaths.jsx
import { styles } from '../../styles/styles';

export default function ManagePaths({
  locations,
  from, setFrom,
  to, setTo,
  distance, setDistance,
  handleAddPath,
  handleRemovePath
}) {
  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <h6 style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>Add Path</h6>
        <div style={styles.gpsForm}>
          <select value={from} onChange={e => setFrom(e.target.value)} style={styles.select}>
            <option value="">From</option>
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <select value={to} onChange={e => setTo(e.target.value)} style={styles.select}>
            <option value="">To</option>
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <input
            value={distance}
            onChange={e => setDistance(e.target.value)}
            placeholder="Distance (meters)"
            type="number"
            style={styles.input}
          />
        </div>
        <button onClick={handleAddPath} style={styles.button('success')} className="mt-2">
          Add Path
        </button>
      </div>

      <div>
        <h6 style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>Remove Path</h6>
        <div style={styles.gpsForm}>
          <select value={from} onChange={e => setFrom(e.target.value)} style={styles.select}>
            <option value="">From</option>
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <select value={to} onChange={e => setTo(e.target.value)} style={styles.select}>
            <option value="">To</option>
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>
        <button onClick={handleRemovePath} style={styles.button('danger')} className="mt-2">
          Remove Path
        </button>
      </div>
    </div>
  );
}