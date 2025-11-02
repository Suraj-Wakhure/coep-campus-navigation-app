// src/components/AdminPanel/AddGPSForm.jsx
import { styles } from '../../styles/styles';
import { useMemo } from 'react';

const Label = ({ children, required }) => (
  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.25rem', display: 'block' }}>
    {children} {required && <span style={{ color: '#dc2626' }}>*</span>}
  </label>
);

export default function AddGPSForm({
  newGPSLocation,
  setNewGPSLocation,
  handleAddGPSLocation,
  /** NEW PROP – the current list of GPS locations (passed from App) */
  gpsLocations = []
}) {
  // -----------------------------------------------------------------------
  // 1. Auto-generate a unique ID based on the selected type + next number
  // -----------------------------------------------------------------------
  const generatedId = useMemo(() => {
    const type = (newGPSLocation.type || 'other').toLowerCase(); // fallback
    // Count how many locations already have this type prefix
    const samePrefix = gpsLocations.filter(loc =>
      loc.id && loc.id.startsWith(type + '_')
    );
    const nextNum = samePrefix.length + 1;
    return `${type}_${String(nextNum).padStart(3, '0')}`; // e.g. office_001
  }, [newGPSLocation.type, gpsLocations]);

  const update = (field, value) => {
    setNewGPSLocation(prev => ({
      ...prev,
      [field]: value,
      // Force id to be the generated one when type changes
      ...(field === 'type' ? { id: generatedId } : {})
    }));
  };

  // When the component mounts, set the initial generated id (if type already selected)
  // This is a tiny side-effect – safe because it only writes once.
  // (You could also move this logic to App, but keeping it here is cleaner.)
  // useEffect(() => {
  //   setNewGPSLocation(prev => ({ ...prev, id: generatedId }));
  // }, [generatedId, setNewGPSLocation]);

  return (
    <div>
      <h5 style={{ margin: '0 0 1.25rem', color: '#1f2937', fontWeight: 700, fontSize: '1.1rem' }}>
        Add New GPS Location
      </h5>

      <div style={{
        ...styles.gpsForm,
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'
      }}>
        {/* === AUTO-GENERATED ID (READ-ONLY) === */}
        <div>
          <Label required>ID (auto-generated)</Label>
          <input
            value={generatedId}
            readOnly
            style={{ ...styles.input, backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
          />
        </div>

        {/* === BASIC INFO === */}
        <div>
          <Label required>Location Name</Label>
          <input
            value={newGPSLocation.name || ''}
            onChange={e => update('name', e.target.value)}
            placeholder="e.g. Establishment Section"
            style={styles.input}
            required
          />
        </div>

        {/* === COORDINATES === */}
        <div>
          <Label required>Latitude</Label>
          <input
            value={newGPSLocation.lat || ''}
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
            value={newGPSLocation.lng || ''}
            onChange={e => update('lng', e.target.value)}
            type="number"
            step="0.000001"
            placeholder="73.8562"
            style={styles.input}
            required
          />
        </div>

        {/* === TYPE & CAMPUS === */}
        <div>
          <Label required>Campus</Label>
          <select
            value={newGPSLocation.campus_type || 'North'}
            onChange={e => update('campus_type', e.target.value)}
            style={styles.select}
          >
            <option value="North">North Campus</option>
            <option value="South">South Campus</option>
          </select>
        </div>

        <div>
          <Label required>Type (determines ID prefix)</Label>
          <select
            value={newGPSLocation.type || ''}
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

        {/* === LOCATION DETAILS === */}
        <div>
          <Label>Description</Label>
          <input
            value={newGPSLocation.description || ''}
            onChange={e => update('description', e.target.value)}
            placeholder="Optional info"
            style={styles.input}
          />
        </div>

        <div>
          <Label>Building Name</Label>
          <input
            value={newGPSLocation.building_name || ''}
            onChange={e => update('building_name', e.target.value)}
            placeholder="e.g. Main Building"
            style={styles.input}
          />
        </div>

        {/* === BUILDING & PRIORITY === */}
        <div>
          <Label>Floor Number</Label>
          <input
            value={newGPSLocation.floor_number || ''}
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
            value={newGPSLocation.priority || ''}
            onChange={e => update('priority', e.target.value)}
            type="number"
            min="1"
            max="10"
            placeholder="5"
            style={styles.input}
          />
        </div>

        {/* === ZOOM LEVELS === */}
        <div>
          <Label>Min Zoom Level</Label>
          <input
            value={newGPSLocation.minZoom || ''}
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
            value={newGPSLocation.maxZoom || ''}
            onChange={e => update('maxZoom', e.target.value)}
            type="number"
            min="1"
            max="22"
            placeholder="22"
            style={styles.input}
          />
        </div>
      </div>

      {/* Submit */}
      <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
        <button
          onClick={handleAddGPSLocation}
          style={styles.button('primary')}
        >
          Add Location
        </button>
      </div>

      {/* Required hint */}
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