'use client';

import styles from './AgrementTimeline.module.css';

const STEPS = [
  { key: 'en_attente', label: 'Documents en attente' },
  { key: 'soumis_moe', label: 'Soumis au MOE' },
  { key: 'valide_moe', label: 'Validé MOE' },
  { key: 'soumis_moa', label: 'Soumis au MOA' },
  { key: 'agree', label: 'Agréé' }
];

export default function AgrementTimeline({ status, dates = {}, delaiJours = 21 }) {
  const currentIndex = STEPS.findIndex(s => s.key === status);

  return (
    <div className={styles.container}>
      <div className={styles.timeline}>
        {STEPS.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={step.key} className={styles.step}>
              <div className={`${styles.stepIcon} ${isCompleted ? styles.completed : ''} ${isActive ? styles.active : ''} ${isPending ? styles.pending : ''}`}>
                {isCompleted ? '✓' : index + 1}
              </div>
              <div className={styles.stepLabel}>{step.label}</div>
              {dates[step.key] && (
                <div className={styles.stepDate}>
                  {new Date(dates[step.key]).toLocaleDateString('fr-FR')}
                </div>
              )}
              {index < STEPS.length - 1 && (
                <div className={`${styles.stepLine} ${isCompleted ? styles.completed : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {status === 'soumis_moe' && (
        <div className={styles.alert}>
          ⏳ Délai de {delaiJours} jours — Silence vaut acceptation
        </div>
      )}
    </div>
  );
}
