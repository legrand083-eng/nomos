'use client';

import { useState } from 'react';
import styles from './admin.module.css';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'monitoring', label: 'Monitoring', icon: '📊', items: [
      { id: 'p00', label: 'Vue d\'ensemble', href: '/dashboard/admin/panels/p00-overview' },
      { id: 'p01', label: 'Activité temps réel', href: '/dashboard/admin/panels/p01-activity' },
      { id: 'p02', label: 'Performance API', href: '/dashboard/admin/panels/p02-performance' },
      { id: 'p03', label: 'Logs système', href: '/dashboard/admin/panels/p03-logs' },
      { id: 'p04', label: 'Alertes critiques', href: '/dashboard/admin/panels/p04-alerts' }
    ]},
    { id: 'users', label: 'Utilisateurs', icon: '👥', items: [
      { id: 'p05', label: 'Liste utilisateurs', href: '/dashboard/admin/panels/p05-users' },
      { id: 'p06', label: 'Rôles & permissions', href: '/dashboard/admin/panels/p06-roles' },
      { id: 'p07', label: 'Sessions actives', href: '/dashboard/admin/panels/p07-sessions' },
      { id: 'p08', label: 'Historique connexions', href: '/dashboard/admin/panels/p08-login-history' }
    ]},
    { id: 'security', label: 'Sécurité', icon: '🔒', items: [
      { id: 'p09', label: 'Audit trail', href: '/dashboard/admin/panels/p09-audit' },
      { id: 'p10', label: 'Tentatives échouées', href: '/dashboard/admin/panels/p10-failed-logins' },
      { id: 'p11', label: 'IP bloquées', href: '/dashboard/admin/panels/p11-blocked-ips' },
      { id: 'p12', label: 'Sauvegardes', href: '/dashboard/admin/panels/p12-backups' }
    ]},
    { id: 'business', label: 'Business', icon: '💼', items: [
      { id: 'p13', label: 'Tenants', href: '/dashboard/admin/panels/p13-tenants' },
      { id: 'p14', label: 'Opérations globales', href: '/dashboard/admin/panels/p14-operations' },
      { id: 'p15', label: 'Templates email', href: '/dashboard/admin/panels/p15-email-templates' },
      { id: 'p16', label: 'Jours fériés', href: '/dashboard/admin/panels/p16-holidays' },
      { id: 'p17', label: 'Exports comptables', href: '/dashboard/admin/panels/p17-exports' }
    ]},
    { id: 'support', label: 'Support', icon: '🎫', items: [
      { id: 'p18', label: 'Tickets', href: '/dashboard/admin/panels/p18-tickets' },
      { id: 'p19', label: 'FAQ', href: '/dashboard/admin/panels/p19-faq' },
      { id: 'p20', label: 'Documentation', href: '/dashboard/admin/panels/p20-docs' },
      { id: 'p21', label: 'Changelog', href: '/dashboard/admin/panels/p21-changelog' }
    ]}
  ];

  return (
    <div className={styles.adminLayout}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          <h2>Admin M1</h2>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          {menuItems.map(section => (
            <div key={section.id} className={styles.navSection}>
              <div className={styles.navSectionHeader}>
                <span className={styles.navIcon}>{section.icon}</span>
                {sidebarOpen && <span>{section.label}</span>}
              </div>
              {sidebarOpen && (
                <ul className={styles.navItems}>
                  {section.items.map(item => (
                    <li key={item.id}>
                      <a href={item.href}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>
      </aside>
      <main className={styles.adminMain}>
        {children}
      </main>
    </div>
  );
}
