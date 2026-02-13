'use client';

import styles from './RemboursementProgress.module.css';

export default function RemboursementProgress({ avance, situations }) {
  if (!avance || !avance.date_versement) {
    return null;
  }

  const montantAvance = avance.montant_avance;
  const cumulRembourse = avance.cumul_rembourse || 0;
  const soldeRestant = avance.solde_restant || montantAvance;
  const progress = montantAvance > 0 ? ((cumulRembourse / montantAvance) * 100).toFixed(1) : 0;

  const situationsAvecRemb = situations?.filter(s => s.montant_remb_avance > 0) || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>Remboursement Progressif</h4>
        <span className={styles.progress}>{progress}%</span>
      </div>

      <div className={styles.amounts}>
        <div className={styles.amountCard}>
          <span className={styles.label}>Avance versée</span>
          <span className={styles.value}>{montantAvance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
        </div>
        <div className={styles.amountCard}>
          <span className={styles.label}>Cumul remboursé</span>
          <span className={`${styles.value} ${styles.cyan}`}>{cumulRembourse.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
        </div>
        <div className={styles.amountCard}>
          <span className={styles.label}>Solde restant</span>
          <span className={`${styles.value} ${styles.gold}`}>{soldeRestant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
      </div>

      {situationsAvecRemb.length > 0 && (
        <div className={styles.history}>
          <h5 className={styles.historyTitle}>Historique des remboursements</h5>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Situation</th>
                <th>Date</th>
                <th>Montant remboursé</th>
                <th>Cumul</th>
              </tr>
            </thead>
            <tbody>
              {situationsAvecRemb.map((sit, idx) => (
                <tr key={sit.id}>
                  <td>#{sit.numero}</td>
                  <td>{new Date(sit.date_depot).toLocaleDateString('fr-FR')}</td>
                  <td className={styles.montant}>{sit.montant_remb_avance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
                  <td className={styles.cumul}>{sit.cumul_remb_avance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
