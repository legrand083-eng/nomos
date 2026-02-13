'use client';

import styles from './KPICard.module.css';

export default function KPICard({ 
  label, 
  value, 
  unit = '', 
  trend = null, 
  color = 'default',
  icon = null 
}) {
  const getColorClass = () => {
    switch (color) {
      case 'success': return styles.colorSuccess;
      case 'warning': return styles.colorWarning;
      case 'error': return styles.colorError;
      case 'gold': return styles.colorGold;
      case 'cyan': return styles.colorCyan;
      default: return styles.colorDefault;
    }
  };

  const getTrendClass = () => {
    if (trend === null) return '';
    return trend >= 0 ? styles.trendPositive : styles.trendNegative;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.label}>{label}</span>
      </div>
      <div className={`${styles.value} ${getColorClass()}`}>
        {value}
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
      {trend !== null && (
        <div className={`${styles.trend} ${getTrendClass()}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}{unit}
        </div>
      )}
    </div>
  );
}
