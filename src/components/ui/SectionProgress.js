'use client';

import styles from './SectionProgress.module.css';

export default function SectionProgress({ percentage }) {
  const getColor = () => {
    if (percentage === 0) return 'var(--color-error)';
    if (percentage === 100) return 'var(--color-success)';
    return 'var(--color-warning)';
  };

  const strokeDasharray = 2 * Math.PI * 18; // circumference
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

  return (
    <div className={styles.container}>
      <svg className={styles.svg} width="48" height="48">
        <circle
          className={styles.bgCircle}
          cx="24"
          cy="24"
          r="18"
          fill="none"
          stroke="var(--border-color)"
          strokeWidth="4"
        />
        <circle
          className={styles.progressCircle}
          cx="24"
          cy="24"
          r="18"
          fill="none"
          stroke={getColor()}
          strokeWidth="4"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
        />
      </svg>
      <span className={styles.percentage} style={{ color: getColor() }}>
        {percentage === 100 ? '✓' : `${percentage}%`}
      </span>
    </div>
  );
}
