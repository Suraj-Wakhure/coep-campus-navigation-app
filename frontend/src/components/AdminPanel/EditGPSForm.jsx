// src/components/AdminPanel/EditGPSForm.jsx
import { styles } from '../../styles/styles';

const Label = ({ children, required }) => (
  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.25rem', display: 'block' }}>
    {children} {required && <span style={{ color: '#dc2626' }}>*</span>}
  </label>
);

export default function EditGPSForm({
  editingLocation,
  setEditingLocation,
  handleUpdateGPSLocation,
  cancelEditLocation
}) {
  const update = (field, value) => {
    setEditingLocation(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <h5 style={{ margin: '0 0 1.25rem', color: '#1f2937', fontWeight: 700, fontSize: '1.1rem' }}>
        Edit GPS Location – {editingLocation.name}
      </h5>

      <div style={{
        ...styles.gpsForm,
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'
      }}>
        {/* READ-ONLY ID */}
        <div>
          <Label required>ID (cannot be changed)</Label>
          <input
            value={editingLocation.id || ''}
            readOnly
            style={{ ...styles.input, backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
          />
        </div>

        {/* NAME */}
        <div>
          <Label required>Location Name</Label>
          <input
            value={editingLocation.name || ''}
            onChange={e => update('name', e.target.value)}
            placeholder="e.g. Establishment Section"
            style={styles.input}
            required
          />
        </div>

        {/* COORDINATES */}
        <div>
          <Label required>Latitude</Label>
          <input
            value={editingLocation.lat || ''}
            onChange={e => update('lat', e.target.value)}
            type="number"
            step="0.000001"
            placeholder="18.5294"
            style={styles.input}
            required
          />
        </div>

        <div>
          <Label required>Longitude</Label>
          <input
            value={editingLocation.lng || ''}
            onChange={e => update('lng', e.target.value)}
            type="number"
            step="0.000001"
            placeholder="73.8562"
            style={styles.input}
            required
          />
        </div>

        {/* CAMPUS & TYPE */}
        <div>
          <Label required>Campus</Label>
          <select
            value={editingLocation.campus_type || 'North'}
            onChange={e => update('campus_type', e.target.value)}
            style={styles.select}
          >
            <option value="North">North Campus</option>
            <option value="South">South Campus</option>
          </select>
        </div>

        <div>
          <Label required>Type</Label>
          <select
            value={editingLocation.type || ''}
            onChange={e => update('type', e.target.value)}
            style={styles.select}
          >
            <option value="">Select Type</option>
            <option value="Office">Office</option>
            <option value="Department">Department</option>
            <option value="Canteen">Canteen</option>
            <option value="Hostel">Hostel</option>
            <option value="Gate">Gate</option>
            <option value="Classroom">Classroom</option>
            <option value="Lab">Lab</option>
            <option value="Library">Library</option>
            <option value="Auditorium">Auditorium</option>
            <option value="Parking">Parking</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* OPTIONAL DETAILS */}
        <div>
          <Label>Description</Label>
          <input
            value={editingLocation.description || ''}
            onChange={e => update('description', e.target.value)}
            placeholder="Optional info"
            style={styles.input}
          />
        </div>

        <div>
          <Label>Building Name</Label>
          <input
            value={editingLocation.building_name || ''}
            onChange={e => update('building_name', e.target.value)}
            placeholder="e.g. Main Building"
            style={styles.input}
          />
        </div>

        <div>
          <Label>Floor Number</Label>
          <input
            value={editingLocation.floor_number || ''}
            onChange={e => update('floor_number', e.target.value)}
            type="number"
            min="0"
            placeholder="e.g. 2"
            style={styles.input}
          />
        </div>

        <div>
          <Label>Priority (1–10)</Label>
          <input
            value={editingLocation.priority || ''}
            onChange={e => update('priority', e.target.value)}
            type="number"
            min="1"
            max="10"
            placeholder="5"
            style={styles.input}
          />
        </div>

        <div>
          <Label>Min Zoom Level</Label>
          <input
            value={editingLocation.minZoom || ''}
            onChange={e => update('minZoom', e.target.value)}
            type="number"
            min="1"
            max="22"
            placeholder="16"
            style={styles.input}
          />
        </div>

        <div>
          <Label>Max Zoom Level</Label>
          <input
            value={editingLocation.maxZoom || ''}
            onChange={e => update('maxZoom', e.target.value)}
            type="number"
            min="1"
            max="22"
            placeholder="22"
            style={styles.input}
          />
        </div>
      </div>

      {/* BUTTONS */}
      <div style={{ marginTop: '1.5rem', textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button onClick={handleUpdateGPSLocation} style={styles.button('primary')}>
          Save Changes
        </button>
        <button onClick={cancelEditLocation} style={styles.button()}>
          Cancel
        </button>
      </div>

      {/* REQUIRED HINT */}
      <p style={{
        marginTop: '1rem',
        fontSize: '0.8rem',
        color: '#6b7280',
        fontStyle: 'italic'
      }}>
        <span style={{ color: '#dc2626' }}>*</span> Required fields
      </p>
    </div>
  );
}