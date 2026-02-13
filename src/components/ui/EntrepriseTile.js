'use client';

import styles from './EntrepriseTile.module.css';
import StatusBadge from './StatusBadge';

export default function EntrepriseTile({ 
  lotNumero, 
  entrepriseName, 
  status = 'grey', 
  avancement = 0, 
  isActive = false,
  onClick 
}) {
  const getStatusClass = () => {
    switch (status) {
      case 'grey': return styles.statusGrey;
      case 'violet': return styles.statusViolet;
      case 'green': return styles.statusGreen;
      case 'orange': return styles.statusOrange;
      default: return styles.statusGrey;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'grey': return 'Non déposé';
      case 'violet': return 'En attente';
      case 'green': return 'Validé';
      case 'orange': return 'Alerte';
      default: return 'Non déposé';
    }
  };

  return (
    <div 
      className={`${styles.tile} ${getStatusClass()} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <div className={styles.header}>
        <span className={styles.lotNumber}>Lot {lotNumero}</span>
        <StatusBadge status={status} label={getStatusLabel()} />
      </div>
      <div className={styles.entrepriseName}>{entrepriseName}</div>
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${Math.min(avancement, 100)}%` }}
          />
        </div>
        <span className={styles.progressText}>{avancement.toFixed(1)}%</span>
      </div>
    </div>
  );
}
