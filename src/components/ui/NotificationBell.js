'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './NotificationBell.module.css';

export default function NotificationBell({ notifications = [], onMarkAsRead }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'var(--color-error)';
      case 'high': return 'var(--color-warning)';
      case 'normal': return 'var(--color-cyan)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span className={styles.unreadCount}>{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
            )}
          </div>

          <div className={styles.list}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>Aucune notification</div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`${styles.item} ${!notif.is_read ? styles.unread : ''}`}
                  onClick={() => {
                    if (!notif.is_read && onMarkAsRead) {
                      onMarkAsRead(notif.id);
                    }
                    if (notif.link) {
                      window.location.href = notif.link;
                    }
                  }}
                >
                  <div
                    className={styles.priorityIndicator}
                    style={{ backgroundColor: getPriorityColor(notif.priority) }}
                  />
                  <div className={styles.content}>
                    <div className={styles.title}>{notif.title}</div>
                    {notif.message && (
                      <div className={styles.message}>{notif.message}</div>
                    )}
                    <div className={styles.time}>
                      {new Date(notif.created_at).toLocaleString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
