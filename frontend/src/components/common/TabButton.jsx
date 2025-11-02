// src/components/common/TabButton.jsx
import { styles } from '../../styles/styles';

export default function TabButton({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={styles.tab(active)}>
      {children}
    </button>
  );
}