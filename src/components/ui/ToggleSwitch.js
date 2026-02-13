'use client';

import styles from './ToggleSwitch.module.css';

export default function ToggleSwitch({ 
  checked, 
  onChange, 
  label, 
  name,
  disabled = false 
}) {
  const handleChange = (e) => {
    onChange(e.target.checked);
  };

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      )}
      <label className={styles.switch}>
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className={styles.input}
        />
        <span className={styles.slider}></span>
      </label>
    </div>
  );
}
