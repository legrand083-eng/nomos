'use client';

import styles from './Timeline.module.css';

export default function Timeline({ currentStep = 'depot' }) {
  const steps = [
    { id: 'depot', label: 'Dépôt Entreprise' },
    { id: 'opc', label: 'Contrôle OPC' },
    { id: 'moe', label: 'Contrôle MOE' },
    { id: 'certificat', label: 'Certificat' }
  ];

  const getStepIndex = (stepId) => steps.findIndex(s => s.id === stepId);
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className={styles.timeline}>
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        const isPending = index > currentIndex;

        return (
          <div key={step.id} className={styles.stepContainer}>
            <div className={styles.stepWrapper}>
              <div
                className={`${styles.stepCircle} ${
                  isCompleted ? styles.completed :
                  isActive ? styles.active :
                  styles.pending
                }`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`${styles.connector} ${isCompleted ? styles.connectorCompleted : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
