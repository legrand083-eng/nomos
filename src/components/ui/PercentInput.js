'use client';

import { useState, useEffect } from 'react';
import styles from './PercentInput.module.css';

export default function PercentInput({ 
  value, 
  onChange, 
  label, 
  name,
  required = false,
  disabled = false,
  min = 0,
  max = 100,
  step = 0.01
}) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value !== null && value !== undefined && value !== '') {
      setDisplayValue(parseFloat(value).toFixed(2));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e) => {
    const input = e.target.value;
    setDisplayValue(input);
  };

  const handleBlur = () => {
    const parsed = parseFloat(displayValue);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
      setDisplayValue(clamped.toFixed(2));
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
          type="number"
          id={name}
          name={name}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={styles.input}
          placeholder="0,00"
        />
        <span className={styles.percent}>%</span>
      </div>
    </div>
  );
}
