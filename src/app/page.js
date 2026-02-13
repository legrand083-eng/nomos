'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>NOMOΣ</h1>
          <p className={styles.subtitle}>νόμος — The Standard, The Rule</p>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={() => router.push('/connexion')}
          aria-label="Accéder à la connexion"
        >
          ENTER
        </button>

        <div className={styles.badge}>
          <span className={styles.badgeText}>Groupe QUESTOR</span>
        </div>
      </div>
    </div>
  );
}
