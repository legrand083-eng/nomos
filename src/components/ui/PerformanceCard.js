'use client';

import styles from './PerformanceCard.module.css';

export default function PerformanceCard({ title, value, unit, trend, color = 'cyan' }) {
  return (
    <div className={styles.card} data-color={color}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {trend && (
          <span className={styles.trend} data-trend={trend > 0 ? 'up' : 'down'}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className={styles.value}>
        {value}
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
    </div>
  );
}
