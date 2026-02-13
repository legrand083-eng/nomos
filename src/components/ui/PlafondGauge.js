'use client';

import { useEffect, useRef } from 'react';
import styles from './PlafondGauge.module.css';

export default function PlafondGauge({ cumulPenalites, plafond, montantMarche }) {
  const canvasRef = useRef(null);
  
  const tauxCumul = montantMarche > 0 ? (cumulPenalites / montantMarche) * 100 : 0;
  const tauxPlafond = plafond || 10; // Default 10% CCAG
  const progression = (tauxCumul / tauxPlafond) * 100;
  const atteintPlafond = progression >= 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, 2.25 * Math.PI);
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#1a2332';
    ctx.stroke();

    // Progress arc
    const endAngle = 0.75 * Math.PI + (progression / 100) * 1.5 * Math.PI;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, endAngle);
    ctx.lineWidth = 20;
    
    // Gradient color based on progression
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    if (progression < 70) {
      gradient.addColorStop(0, '#00EEFF'); // Cyan
      gradient.addColorStop(1, '#C3A227'); // Gold
    } else if (progression < 90) {
      gradient.addColorStop(0, '#F59E0B'); // Warning
      gradient.addColorStop(1, '#EF4444'); // Error
    } else {
      gradient.addColorStop(0, '#EF4444'); // Error
      gradient.addColorStop(1, '#B91C1C'); // Dark red
    }
    ctx.strokeStyle = gradient;
    ctx.stroke();

    // Center text
    ctx.fillStyle = atteintPlafond ? '#EF4444' : '#00EEFF';
    ctx.font = 'bold 28px "JetBrains Mono"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${tauxCumul.toFixed(2)}%`, centerX, centerY);

  }, [tauxCumul, tauxPlafond, progression, atteintPlafond]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>Plafond Pénalités</h4>
        {atteintPlafond && (
          <span className={styles.alertBadge}>⚠ PLAFOND ATTEINT</span>
        )}
      </div>

      <div className={styles.gaugeContainer}>
        <canvas ref={canvasRef} width={200} height={200} className={styles.canvas} />
      </div>

      <div className={styles.info}>
        <div className={styles.row}>
          <span className={styles.label}>Cumul pénalités :</span>
          <span className={styles.value}>{cumulPenalites.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Montant marché :</span>
          <span className={styles.value}>{montantMarche.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Plafond (CCAG) :</span>
          <span className={`${styles.value} ${styles.gold}`}>{tauxPlafond}%</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Montant plafond :</span>
          <span className={`${styles.value} ${styles.gold}`}>{((montantMarche * tauxPlafond) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
        </div>
      </div>

      {progression >= 70 && !atteintPlafond && (
        <div className={styles.warning}>
          <span className={styles.warningIcon}>⚠</span>
          <span className={styles.warningText}>
            Attention : {(100 - progression).toFixed(1)}% restant avant plafond
          </span>
        </div>
      )}

      {atteintPlafond && (
        <div className={styles.error}>
          <span className={styles.errorIcon}>🛑</span>
          <span className={styles.errorText}>
            Plafond CCAG atteint. Nouvelles pénalités non applicables.
          </span>
        </div>
      )}
    </div>
  );
}
