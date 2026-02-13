'use client';

import { useEffect, useRef } from 'react';
import styles from './IndiceChart.module.css';

export default function IndiceChart({ data, indiceBase, moisReference }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find min/max values
    const values = data.map(d => d.valeur);
    const minValue = Math.min(...values, indiceBase) * 0.98;
    const maxValue = Math.max(...values, indiceBase) * 1.02;

    // Margins
    const marginLeft = 60;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = 40;

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    // Scale functions
    const scaleX = (index) => marginLeft + (index / (data.length - 1)) * chartWidth;
    const scaleY = (value) => marginTop + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;

    // Draw grid lines
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 5; i++) {
      const y = marginTop + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(marginLeft, y);
      ctx.lineTo(width - marginRight, y);
      ctx.stroke();
    }

    // Draw base line (indice de référence)
    const baseY = scaleY(indiceBase);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim();
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(marginLeft, baseY);
    ctx.lineTo(width - marginRight, baseY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw line chart
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--cyan').trim();
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((point, index) => {
      const x = scaleX(index);
      const y = scaleY(point.valeur);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw points
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--cyan').trim();
    data.forEach((point, index) => {
      const x = scaleX(index);
      const y = scaleY(point.valeur);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Y-axis labels
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
    ctx.font = '12px "DM Sans"';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (i / 5) * (maxValue - minValue);
      const y = marginTop + ((5 - i) / 5) * chartHeight;
      ctx.fillText(value.toFixed(1), marginLeft - 10, y + 4);
    }

    // Draw X-axis labels (every 3 months)
    ctx.textAlign = 'center';
    data.forEach((point, index) => {
      if (index % 3 === 0 || index === data.length - 1) {
        const x = scaleX(index);
        const date = new Date(point.mois);
        const label = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        ctx.fillText(label, x, height - marginBottom + 20);
      }
    });

  }, [data, indiceBase, moisReference]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Évolution de l'indice</h3>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={styles.legendLine} style={{ background: 'var(--cyan)' }}></span>
            <span className={styles.legendLabel}>Indice actuel</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendLine} style={{ background: 'var(--gold)', borderStyle: 'dashed' }}></span>
            <span className={styles.legendLabel}>Indice de référence (M0)</span>
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        className={styles.canvas}
      />
    </div>
  );
}
