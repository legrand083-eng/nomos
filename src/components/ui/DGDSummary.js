'use client';
import styles from './DGDSummary.module.css';

export default function DGDSummary({ dgd }) {
  const lines = [
    { label: 'Total travaux HT', value: dgd.total_travaux_ht, type: 'positive' },
    { label: 'Révision de prix', value: dgd.total_revision, type: 'positive' },
    { label: 'Pénalités de retard', value: dgd.total_penalites, type: 'negative' },
    { label: 'Retenue de garantie (5%)', value: -dgd.retenue_garantie, type: 'negative', note: dgd.rg_liberee ? 'Libérée' : 'Non libérée' },
    { label: 'Avances remboursées', value: -dgd.total_avances_remboursees, type: 'negative' },
    { label: 'Solde compte prorata', value: dgd.solde_prorata, type: dgd.solde_prorata >= 0 ? 'positive' : 'negative' },
    { label: 'Exécution aux frais', value: -dgd.execution_aux_frais, type: 'negative' }
  ];

  return (
    <div className={styles.summary}>
      <div className={styles.lines}>
        {lines.map((line, idx) => (
          <div key={idx} className={styles.line}>
            <span className={styles.label}>
              {line.label}
              {line.note && <span className={styles.note}> ({line.note})</span>}
            </span>
            <span className={`${styles.value} ${styles[line.type]}`}>
              {line.value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.total}>
        <span className={styles.totalLabel}>SOLDE NET DGD</span>
        <span className={styles.totalValue}>
          {dgd.solde_net_dgd.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </span>
      </div>
    </div>
  );
}
