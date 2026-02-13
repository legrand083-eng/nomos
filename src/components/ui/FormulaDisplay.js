'use client';

import { useState, useEffect } from 'react';
import styles from './FormulaDisplay.module.css';

export default function FormulaDisplay({ formule, onChange, readOnly = false }) {
  const [partieFixe, setPartieFixe] = useState(formule?.partie_fixe || 0.15);
  const [partieVariable, setPartieVariable] = useState(formule?.partie_variable || 0.85);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    // Validate: a + b must equal 1.00
    const sum = parseFloat(partieFixe) + parseFloat(partieVariable);
    const valid = Math.abs(sum - 1.0) < 0.0001;
    setIsValid(valid);
  }, [partieFixe, partieVariable]);

  const handlePartieFixeChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setPartieFixe(value);
    if (onChange) {
      onChange({ partie_fixe: value, partie_variable: partieVariable });
    }
  };

  const handlePartieVariableChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setPartieVariable(value);
    if (onChange) {
      onChange({ partie_fixe: partieFixe, partie_variable: value });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formulaDisplay}>
        <span className={styles.formulaText}>P = P₀ × (</span>
        <input
          type="number"
          step="0.0001"
          min="0"
          max="1"
          value={partieFixe}
          onChange={handlePartieFixeChange}
          className={styles.formulaInput}
          disabled={readOnly}
        />
        <span className={styles.formulaText}>+ </span>
        <input
          type="number"
          step="0.0001"
          min="0"
          max="1"
          value={partieVariable}
          onChange={handlePartieVariableChange}
          className={styles.formulaInput}
          disabled={readOnly}
        />
        <span className={styles.formulaText}>× BT/BT₀)</span>
      </div>

      <div className={styles.validation}>
        {isValid ? (
          <div className={styles.validCheck}>
            <span className={styles.checkIcon}>✓</span>
            <span className={styles.checkText}>Formule valide (a + b = 1.00)</span>
          </div>
        ) : (
          <div className={styles.invalidCheck}>
            <span className={styles.errorIcon}>✗</span>
            <span className={styles.errorText}>
              Erreur : a + b = {(parseFloat(partieFixe) + parseFloat(partieVariable)).toFixed(4)} (doit être 1.00)
            </span>
          </div>
        )}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <strong>a</strong> : Partie fixe (non révisable)
        </div>
        <div className={styles.legendItem}>
          <strong>b</strong> : Partie variable (révisable)
        </div>
        <div className={styles.legendItem}>
          <strong>BT</strong> : Indice du mois de la situation
        </div>
        <div className={styles.legendItem}>
          <strong>BT₀</strong> : Indice du mois de référence (M0)
        </div>
      </div>
    </div>
  );
}
