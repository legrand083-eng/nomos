'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('nomos_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Tableau de bord</h1>
        <p className="text-muted">
          Bienvenue, {user.firstName} {user.lastName}
        </p>
      </div>

      <div className={styles.grid}>
        <div className="card">
          <h2>Sélecteur d'opération</h2>
          <p className="text-muted">
            Sélectionnez une opération pour accéder aux fonctionnalités.
          </p>
          <div className={styles.operationCard}>
            <div className={styles.operationHeader}>
              <span className="text-brand">Opération TOTEM</span>
              <span className="badge badge-moe">Actif</span>
            </div>
            <p className="text-muted">31 logements locatifs — St Laurent du Var</p>
            <div className={styles.operationStats}>
              <div>
                <span className="text-mono text-gold">4 850 000 €</span>
                <span className="text-muted"> HT</span>
              </div>
              <div>
                <span className="text-muted">5 lots</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Accès rapide</h2>
          <p className="text-muted">Fonctionnalités disponibles selon votre rôle</p>
          <div className={styles.quickLinks}>
            <span className={`badge badge-${user.role}`}>
              {user.role.toUpperCase()}
            </span>
            <p className="text-muted" style={{ marginTop: 'var(--space-13)' }}>
              Les modules métier seront disponibles dans la Phase 2
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Phase 1 — Fondations techniques</h3>
        <p className="text-muted">
          Cette version contient les fondations de NOMOΣ : authentification, structure de base, 
          design system et navigation. Les modules métier (certificats de paiement, révision de prix, 
          pénalités) seront développés dans les phases suivantes.
        </p>
      </div>
    </div>
  );
}
