'use client';

import styles from './GaugeCircle.module.css';

export default function GaugeCircle({ 
  value = 0, 
  max = 100, 
  label = '', 
  unit = '%' 
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage < 50) return 'var(--success)';
    if (percentage < 80) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <div className={styles.gauge}>
      <svg width="120" height="120" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          className={styles.progressCircle}
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          className={styles.valueText}
          fill="var(--gold)"
        >
          {percentage.toFixed(0)}{unit}
        </text>
      </svg>
      {label && <div className={styles.label}>{label}</div>}
    </div>
  );
}
