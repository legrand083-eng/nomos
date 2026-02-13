'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../../components/ui/ThemeToggle';
import styles from './connexion.module.css';

export default function ConnexionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    antiRobot: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      // Store token
      localStorage.setItem('nomos_token', data.accessToken);
      localStorage.setItem('nomos_refresh_token', data.refreshToken);
      localStorage.setItem('nomos_user', JSON.stringify(data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={styles.container}>
      <ThemeToggle className={styles.themeToggle} />
      
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.logo}>NOMOΣ</h1>
          <p className={styles.subtitle}>Connexion sécurisée</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="input-group">
            <label htmlFor="email">Adresse email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input-field"
              placeholder="votre@email.fr"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="input-group">
            <label htmlFor="antiRobot">
              Code anti-robot
              <span className={styles.hint}>
                (3 lettres NOM en MAJUSCULES + 3 lettres prénom en minuscules)
              </span>
            </label>
            <input
              id="antiRobot"
              name="antiRobot"
              type="text"
              className="input-field"
              placeholder="DURchr"
              value={formData.antiRobot}
              onChange={handleChange}
              required
              maxLength={6}
              autoComplete="off"
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <div className={styles.footer}>
            <a href="#" className={styles.forgotPassword}>
              Mot de passe oublié ?
            </a>
          </div>
        </form>

        <div className={styles.badge}>
          <span className="text-muted">POLARIS CONSEIL — Groupe QUESTOR</span>
        </div>
      </div>
    </div>
  );
}
