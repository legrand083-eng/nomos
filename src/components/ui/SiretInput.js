'use client';

import { useState, useEffect } from 'react';
import styles from './SiretInput.module.css';

export default function SiretInput({ 
  value, 
  onChange, 
  label, 
  name,
  required = false,
  disabled = false 
}) {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    if (value && value.length === 14) {
      setIsValid(isValidSiret(value));
    } else {
      setIsValid(null);
    }
  }, [value]);

  const isValidSiret = (siret) => {
    if (!/^\d{14}$/.test(siret)) return false;
    
    // Algorithme de Luhn
    let sum = 0;
    for (let i = 0; i < 14; i++) {
      let digit = parseInt(siret[i]);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return sum % 10 === 0;
  };

  const handleChange = (e) => {
    const input = e.target.value.replace(/\D/g, '').slice(0, 14);
    onChange(input);
  };

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        <input
          type="text"
          id={name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          className={`${styles.input} ${isValid === true ? styles.valid : isValid === false ? styles.invalid : ''}`}
          placeholder="12345678901234"
          maxLength="14"
        />
        {isValid === true && (
          <span className={styles.iconValid}>✓</span>
        )}
        {isValid === false && (
          <span className={styles.iconInvalid}>✗</span>
        )}
      </div>
      {value && value.length === 14 && (
        <span className={`${styles.hint} ${isValid ? styles.hintValid : styles.hintInvalid}`}>
          {isValid ? 'SIRET valide' : 'SIRET invalide (vérifiez la clé de Luhn)'}
        </span>
      )}
    </div>
  );
}
