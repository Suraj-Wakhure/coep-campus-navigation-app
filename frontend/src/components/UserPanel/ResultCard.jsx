// src/components/UserPanel/ResultCard.jsx
import { styles } from '../../styles/styles';

export default function ResultCard({ result }) {
  if (!result) return null;

  return (
    <div style={styles.resultCard}>
      <h3 style={styles.resultTitle}>Route Results</h3>
      {result.distance === 'No Path Found' || result.path.length === 0 ? (
        <p style={styles.pathDisplay}>No path found between these locations</p>
      ) : (
        <>
          <p style={styles.pathDisplay}>Path: {result.path.join(' → ')}</p>
          <p style={styles.pathDisplay}>Total Distance: <strong>{result.distance} meters</strong></p>
          <p style={styles.pathDisplay}>Number of Stops: <strong>{result.path.length}</strong></p>
        </>
      )}
    </div>
  );
}