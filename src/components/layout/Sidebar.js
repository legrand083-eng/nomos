'use client';

import Link from 'next/link';
import styles from './Sidebar.module.css';

const roleMenus = {
  admin: [
    { label: 'Tableau de bord', path: '/dashboard', icon: 'dashboard' },
    { label: 'Utilisateurs', path: '/dashboard/admin/users', icon: 'users' },
    { label: 'Opérations', path: '/dashboard/admin/operations', icon: 'operations' },
    { label: 'Système', path: '/dashboard/admin/system', icon: 'system' }
  ],
  moe: [
    { label: 'Tableau de bord', path: '/dashboard', icon: 'dashboard' },
    { label: 'Certificats', path: '/dashboard/moe/certificats', icon: 'certificate' },
    { label: 'Révision de prix', path: '/dashboard/moe/revision', icon: 'revision' },
    { label: 'Pénalités', path: '/dashboard/moe/penalites', icon: 'penalty' }
  ],
  opc: [
    { label: 'Tableau de bord', path: '/dashboard', icon: 'dashboard' },
    { label: 'Avancement', path: '/dashboard/opc/avancement', icon: 'progress' },
    { label: 'Situations', path: '/dashboard/opc/situations', icon: 'situations' }
  ],
  moa: [
    { label: 'Tableau de bord', path: '/dashboard', icon: 'dashboard' },
    { label: 'Validation', path: '/dashboard/moa/validation', icon: 'validation' },
    { label: 'Paiements', path: '/dashboard/moa/paiements', icon: 'payment' }
  ],
  entreprise: [
    { label: 'Tableau de bord', path: '/dashboard', icon: 'dashboard' },
    { label: 'Mes situations', path: '/dashboard/entreprise/situations', icon: 'situations' },
    { label: 'Documents', path: '/dashboard/entreprise/documents', icon: 'documents' }
  ],
  comptabilite: [
    { label: 'Tableau de bord', path: '/dashboard', icon: 'dashboard' },
    { label: 'Exports', path: '/dashboard/comptabilite/exports', icon: 'export' },
    { label: 'Rapports', path: '/dashboard/comptabilite/rapports', icon: 'reports' }
  ]
};

const icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 4C3 3.44772 3.44772 3 4 3H7C7.55228 3 8 3.44772 8 4V7C8 7.55228 7.55228 8 7 8H4C3.44772 8 3 7.55228 3 7V4Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 4C12 3.44772 12.4477 3 13 3H16C16.5523 3 17 3.44772 17 4V7C17 7.55228 16.5523 8 16 8H13C12.4477 8 12 7.55228 12 7V4Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 13C3 12.4477 3.44772 12 4 12H7C7.55228 12 8 12.4477 8 13V16C8 16.5523 7.55228 17 7 17H4C3.44772 17 3 16.5523 3 16V13Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 13C12 12.4477 12.4477 12 13 12H16C16.5523 12 17 12.4477 17 13V16C17 16.5523 16.5523 17 16 17H13C12.4477 17 12 16.5523 12 16V13Z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  users: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 14C13 12.3431 11.6569 11 10 11C8.34315 11 7 12.3431 7 14M16 7C16 9.20914 14.2091 11 12 11M4 7C4 9.20914 5.79086 11 8 11M10 8C8.89543 8 8 7.10457 8 6C8 4.89543 8.89543 4 10 4C11.1046 4 12 4.89543 12 6C12 7.10457 11.1046 8 10 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  operations: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7L10 3L17 7M3 7L10 11M3 7V13L10 17M17 7L10 11M17 7V13L10 17M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  system: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3C10.5523 3 11 3.44772 11 4V5C11 5.55228 10.5523 6 10 6C9.44772 6 9 5.55228 9 5V4C9 3.44772 9.44772 3 10 3Z" fill="currentColor"/><path d="M14.5 5.5C14.8905 5.10948 15.5237 5.10948 15.9142 5.5C16.3047 5.89052 16.3047 6.52369 15.9142 6.91421L15.2071 7.62132C14.8166 8.01184 14.1834 8.01184 13.7929 7.62132C13.4024 7.23079 13.4024 6.59763 13.7929 6.20711L14.5 5.5Z" fill="currentColor"/><path d="M16 10C16 9.44772 16.4477 9 17 9H18C18.5523 9 19 9.44772 19 10C19 10.5523 18.5523 11 18 11H17C16.4477 11 16 10.5523 16 10Z" fill="currentColor"/><path d="M15.9142 14.5C15.5237 14.1095 14.8905 14.1095 14.5 14.5L13.7929 15.2071C13.4024 15.5976 13.4024 16.2308 13.7929 16.6213C14.1834 17.0118 14.8166 17.0118 15.2071 16.6213L15.9142 15.9142C16.3047 15.5237 16.3047 14.8905 15.9142 14.5Z" fill="currentColor"/><path d="M10 14C10.5523 14 11 14.4477 11 15V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V15C9 14.4477 9.44772 14 10 14Z" fill="currentColor"/><path d="M5.5 14.5C5.10948 14.8905 4.47631 14.8905 4.08579 14.5C3.69526 14.1095 3.69526 13.4763 4.08579 13.0858L4.79289 12.3787C5.18342 11.9882 5.81658 11.9882 6.20711 12.3787C6.59763 12.7692 6.59763 13.4024 6.20711 13.7929L5.5 14.5Z" fill="currentColor"/><path d="M4 10C4 9.44772 3.55228 9 3 9H2C1.44772 9 1 9.44772 1 10C1 10.5523 1.44772 11 2 11H3C3.55228 11 4 10.5523 4 10Z" fill="currentColor"/><path d="M4.08579 5.5C4.47631 5.10948 5.10948 5.10948 5.5 5.5L6.20711 6.20711C6.59763 6.59763 6.59763 7.23079 6.20711 7.62132C5.81658 8.01184 5.18342 8.01184 4.79289 7.62132L4.08579 6.91421C3.69526 6.52369 3.69526 5.89052 4.08579 5.5Z" fill="currentColor"/></svg>,
  certificate: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12L11 14L15 10M5 3H15C16.1046 3 17 3.89543 17 5V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V5C3 3.89543 3.89543 3 5 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  revision: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4V16M16 4V16M4 10H16M8 4V16M12 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  penalty: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  progress: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7L9 11L7 9M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  situations: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 5H7C5.89543 5 5 5.89543 5 7V15C5 16.1046 5.89543 17 7 17H13C14.1046 17 15 16.1046 15 15V7C15 5.89543 14.1046 5 13 5H11M9 5C9 3.89543 9.89543 3 11 3H9C7.89543 3 7 3.89543 7 5M9 5C9 6.10457 9.89543 7 11 7H9C7.89543 7 7 6.10457 7 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  validation: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 10L8 13L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  payment: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 10H17M3 6H17M7 14H13M5 3H15C16.1046 3 17 3.89543 17 5V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V5C3 3.89543 3.89543 3 5 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  documents: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 3H5C3.89543 3 3 3.89543 3 5V15C3 16.1046 3.89543 17 5 17H15C16.1046 17 17 16.1046 17 15V5C17 3.89543 16.1046 3 15 3H13M7 3C7 4.10457 7.89543 5 9 5H11C12.1046 5 13 4.10457 13 3M7 3C7 1.89543 7.89543 1 9 1H11C12.1046 1 13 1.89543 13 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  export: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3V13M10 3L6 7M10 3L14 7M3 13V15C3 16.1046 3.89543 17 5 17H15C16.1046 17 17 16.1046 17 15V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  reports: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 17V11M9 7V3M3 11H15M3 7H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
};

export default function Sidebar({ user, currentPath }) {
  const menu = roleMenus[user.role] || roleMenus.admin;

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {menu.map((item) => {
          const isActive = currentPath === item.path;
          const isComingSoon = item.path !== '/dashboard';
          
          return (
            <Link
              key={item.path}
              href={isComingSoon ? '#' : item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ''} ${isComingSoon ? styles.disabled : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={(e) => isComingSoon && e.preventDefault()}
            >
              <span className={styles.icon}>
                {icons[item.icon]}
              </span>
              <span className={styles.label}>{item.label}</span>
              {isComingSoon && (
                <span className={styles.comingSoon}>Bientôt</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
