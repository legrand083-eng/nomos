'use client';

import styles from './SignatureBlock.module.css';

export default function SignatureBlock({ role, label, date = null, code = null, onSign = null }) {
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const isSigned = date && code;

  return (
    <div className={`${styles.block} ${isSigned ? styles.signed : styles.pending}`}>
      <div className={styles.role}>{role}</div>
      <div className={styles.label}>{label}</div>
      {isSigned ? (
        <>
          <div className={styles.date}>{formatDate(date)}</div>
          <div className={styles.code}>
            <span className={styles.codeLabel}>Code MAÎTRE</span>
            <span className={styles.codeValue}>{code}</span>
          </div>
          <div className={styles.checkmark}>✓</div>
        </>
      ) : (
        <>
          <div className={styles.pendingText}>En attente de signature</div>
          {onSign && (
            <button onClick={onSign} className={styles.signButton}>
              Signer maintenant
            </button>
          )}
        </>
      )}
    </div>
  );
}
