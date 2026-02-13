'use client';
import styles from './ReceptionTimeline.module.css';

export default function ReceptionTimeline({ reception }) {
  const steps = [
    { key: 'reception', label: 'Réception', date: reception.date_reception, done: true },
    { key: 'reserves', label: 'Levée réserves', date: reception.date_levee_reserves, done: !!reception.date_levee_reserves },
    { key: 'garantie', label: 'Fin garantie parfait', date: reception.date_fin_garantie_parfait, done: false },
    { key: 'rg', label: 'Libération RG', date: reception.date_liberation_rg, done: reception.rg_liberee },
    { key: 'decennale', label: 'Fin décennale', date: reception.date_fin_decennale, done: false }
  ];

  return (
    <div className={styles.timeline}>
      {steps.map((step, idx) => (
        <div key={step.key} className={`${styles.step} ${step.done ? styles.done : ''}`}>
          <div className={styles.marker}>
            {step.done ? '✓' : idx + 1}
          </div>
          <div className={styles.content}>
            <div className={styles.label}>{step.label}</div>
            {step.date && (
              <div className={styles.date}>{new Date(step.date).toLocaleDateString('fr-FR')}</div>
            )}
          </div>
          {idx < steps.length - 1 && <div className={styles.connector}></div>}
        </div>
      ))}
    </div>
  );
}
