'use client';

import styles from './WaterfallChart.module.css';

export default function WaterfallChart({ data = [] }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const maxValue = Math.max(...data.map(d => Math.abs(d.value)));

  return (
    <div className={styles.chart}>
      <div className={styles.title}>Décomposition du calcul</div>
      {data.map((item, index) => {
        const isPositive = item.value >= 0;
        const widthPercent = (Math.abs(item.value) / maxValue) * 100;

        return (
          <div key={index} className={styles.row}>
            <div className={styles.label}>
              {item.label}
            </div>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.bar} ${isPositive ? styles.barPositive : styles.barNegative}`}
                style={{ width: `${widthPercent}%` }}
              />
            </div>
            <div className={styles.value}>
              {isPositive ? '+' : ''}{formatCurrency(item.value)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
