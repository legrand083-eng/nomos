'use client';

import { useRouter } from 'next/navigation';
import ThemeToggle from '../ui/ThemeToggle';
import styles from './Header.module.css';

export default function Header({ user }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('nomos_token');
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('nomos_token');
      localStorage.removeItem('nomos_refresh_token');
      localStorage.removeItem('nomos_user');
      router.push('/connexion');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.logo}>NOMOΣ</h1>
      </div>
      
      <div className={styles.right}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            {user.firstName} {user.lastName}
          </span>
          <span className={`badge badge-${user.role}`}>
            {user.role.toUpperCase()}
          </span>
        </div>
        
        <ThemeToggle />
        
        <button 
          onClick={handleLogout}
          className={styles.logoutBtn}
          aria-label="Se déconnecter"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 14L17 10M17 10L13 6M17 10H7M7 17H4C3.46957 17 2.96086 16.7893 2.58579 16.4142C2.21071 16.0391 2 15.5304 2 15V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
