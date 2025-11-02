// src/components/AdminPanel/DeleteLocation.jsx
import { styles } from '../../styles/styles';

export default function DeleteLocation({ location, handleDeleteLocation, onClose }) {
  const { id, name } = location;

  const confirmDelete = () => {
    if (!window.confirm(`Delete "${name}" permanently?`)) return;
    handleDeleteLocation(id);   // <-- pass only the ID
    onClose();                  // close modal after delete
  };

  return (
    <div>
      <h5 style={{ margin: '0 0 1rem', color: '#dc2626' }}>
        Delete GPS Location
      </h5>

      <p style={{ marginBottom: '1rem' }}>
        Are you sure you want to delete <strong>{name}</strong> (ID: <code>{id}</code>)?
        This action <strong>cannot be undone</strong>.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button onClick={confirmDelete} style={styles.button('danger')}>
          Delete
        </button>
        <button onClick={onClose} style={styles.button()}>
          Cancel
        </button>
      </div>
    </div>
  );
}