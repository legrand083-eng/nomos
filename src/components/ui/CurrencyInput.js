'use client';

import { useState, useEffect } from 'react';
import styles from './CurrencyInput.module.css';

export default function CurrencyInput({ 
  value, 
  onChange, 
  label, 
  name,
  required = false,
  disabled = false 
}) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value !== null && value !== undefined && value !== '') {
      const formatted = formatCurrency(parseFloat(value));
      setDisplayValue(formatted);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const formatCurrency = (num) => {
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const parseCurrency = (str) => {
    if (!str) return null;
    const cleaned = str.replace(/\s/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  };

  const handleChange = (e) => {
    const input = e.target.value;
    setDisplayValue(input);
  };

  const handleBlur = () => {
    const parsed = parseCurrency(displayValue);
    if (parsed !== null) {
      onChange(parsed);
      setDisplayValue(formatCurrency(parsed));
    } else {
      onChange(null);
      setDisplayValue('');
    }
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
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          className={styles.input}
          placeholder="0,00"
        />
        <span className={styles.currency}>€</span>
      </div>
    </div>
  );
}
