'use client';

import { useState, useEffect } from 'react';
import styles from './RevisionSimulator.module.css';

export default function RevisionSimulator({ formule, indiceBase, indiceMois }) {
  const [K, setK] = useState(1.0);
  const [exampleAmount, setExampleAmount] = useState(100000);
  const [revisionAmount, setRevisionAmount] = useState(0);

  useEffect(() => {
    if (!formule || !indiceBase || !indiceMois) return;

    // Calculate K
    const a = parseFloat(formule.partie_fixe) || 0.15;
    const b = parseFloat(formule.partie_variable) || 0.85;
    let calculatedK = a + b * (parseFloat(indiceMois) / parseFloat(indiceBase));

    // Apply butoir if applicable
    if (formule.has_butoir) {
      const maxK = 1 + parseFloat(formule.butoir_pourcent) / 100;
      if (calculatedK > maxK) {
        calculatedK = maxK;
      }
    }

    // Apply negative revision clause
    if (!formule.revision_negative_applicable && calculatedK < 1) {
      calculatedK = 1.0;
    }

    setK(calculatedK);

    // Calculate revision amount
    const revision = exampleAmount * (calculatedK - 1);
    setRevisionAmount(revision);
  }, [formule, indiceBase, indiceMois, exampleAmount]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value) => {
    return ((value - 1) * 100).toFixed(2) + ' %';
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Simulation temps réel</h3>

      <div className={styles.kDisplay}>
        <div className={styles.kLabel}>Coefficient K actuel</div>
        <div className={styles.kValue}>{K.toFixed(6)}</div>
        <div className={styles.kPercent}>
          {K >= 1 ? '+' : ''}{formatPercent(K)}
        </div>
      </div>

      <div className={styles.example}>
        <label className={styles.exampleLabel}>
          Montant exemple (HT)
        </label>
        <input
          type="number"
          step="1000"
          min="0"
          value={exampleAmount}
          onChange={(e) => setExampleAmount(parseFloat(e.target.value) || 0)}
          className={styles.exampleInput}
        />
      </div>

      <div className={styles.result}>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>Montant initial :</span>
          <span className={styles.resultValue}>{formatCurrency(exampleAmount)}</span>
        </div>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>Révision de prix :</span>
          <span className={`${styles.resultValue} ${revisionAmount >= 0 ? styles.positive : styles.negative}`}>
            {revisionAmount >= 0 ? '+' : ''}{formatCurrency(revisionAmount)}
          </span>
        </div>
        <div className={`${styles.resultRow} ${styles.total}`}>
          <span className={styles.resultLabel}>Montant révisé :</span>
          <span className={styles.resultValue}>{formatCurrency(exampleAmount + revisionAmount)}</span>
        </div>
      </div>

      {formule?.has_butoir && K >= (1 + parseFloat(formule.butoir_pourcent) / 100) && (
        <div className={styles.alert}>
          ⚠️ Clause butoir appliquée ({formule.butoir_pourcent}%)
        </div>
      )}

      {!formule?.revision_negative_applicable && K < 1 && (
        <div className={styles.info}>
          ℹ️ Révision négative non applicable (K ramené à 1.00)
        </div>
      )}
    </div>
  );
}
