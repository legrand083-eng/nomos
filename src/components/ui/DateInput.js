'use client';

import styles from './DateInput.module.css';

export default function DateInput({ 
  value, 
  onChange, 
  label, 
  name,
  required = false,
  disabled = false,
  min,
  max
}) {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        type="date"
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        min={min}
        max={max}
        className={styles.input}
      />
    </div>
  );
}
