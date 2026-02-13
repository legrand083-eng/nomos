'use client';

import styles from './Stepper.module.css';

export default function Stepper({ steps, currentStep }) {
  return (
    <div className={styles.stepper}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div key={stepNumber} className={styles.step}>
            <div className={styles.stepIndicator}>
              <div className={`${styles.stepCircle} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
                {isCompleted ? '✓' : stepNumber}
              </div>
              {index < steps.length - 1 && (
                <div className={`${styles.stepLine} ${isCompleted ? styles.completed : ''}`} />
              )}
            </div>
            <div className={styles.stepLabel}>
              <div className={styles.stepTitle}>{step.title}</div>
              {step.description && (
                <div className={styles.stepDescription}>{step.description}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
