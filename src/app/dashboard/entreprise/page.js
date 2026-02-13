'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ActionTile from '@/components/ui/ActionTile';
import StatusBadge from '@/components/ui/StatusBadge';
import NotificationBell from '@/components/ui/NotificationBell';
import styles from './dashboard.module.css';

export default function DashboardEntreprisePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    entreprise: {},
    kpis: {},
    situations: [],
    actions: []
  });
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchNotifications();
  }, []);

  const fetchDashboard = async () => {
    try {
      // Mock entreprise ID - replace with actual user context
      const res = await fetch('/api/entreprises/1/dashboard');
      const json = await res.json();
      setData(json);

      // Check for popup notifications
      const popupNotifs = json.notifications?.filter(n => n.is_popup && !n.is_read);
      if (popupNotifs && popupNotifs.length > 0) {
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/entreprises/1/notifications');
      const json = await res.json();
      setNotifications(json.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    await fetch(`/api/entreprises/1/notifications/${notifId}`, {
      method: 'PUT'
    });
    fetchNotifications();
  };

  const handleContester = async (situationId) => {
    const motif = prompt('Motif de la contestation :');
    if (!motif) return;

    try {
      await fetch(`/api/situations/${situationId}/contestations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motif })
      });

      alert('Contestation enregistrée');
      fetchDashboard();
    } catch (error) {
      alert('Erreur lors de la contestation');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Popup notification */}
      {showPopup && (
        <div className={styles.popupOverlay} onClick={() => setShowPopup(false)}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Action requise</h3>
            <p>Vous avez {data.actions.length} action{data.actions.length > 1 ? 's' : ''} urgente{data.actions.length > 1 ? 's' : ''} à traiter.</p>
            <button onClick={() => setShowPopup(false)} className={styles.popupButton}>
              Compris
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tableau de bord</h1>
          <p className={styles.subtitle}>{data.entreprise?.name} — {data.entreprise?.operation_name}</p>
        </div>
        <NotificationBell notifications={notifications} onMarkAsRead={handleMarkAsRead} />
      </div>

      {/* Alert banner */}
      {unreadCount > 0 && (
        <div className={styles.alertBanner}>
          <span className={styles.alertIcon}>🔔</span>
          <span className={styles.alertText}>
            Vous avez {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Actions urgentes */}
      {data.actions && data.actions.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Actions urgentes</h2>
          <div className={styles.actionsGrid}>
            {data.actions.map((action, index) => (
              <ActionTile
                key={index}
                color={action.color}
                title={action.title}
                description={action.description}
                link={action.link}
              />
            ))}
          </div>
        </div>
      )}

      {/* KPIs financiers */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Situation financière</h2>
        <div className={styles.kpisGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Montant du marché</div>
            <div className={styles.kpiValue}>
              {parseFloat(data.kpis.montantMarche || 0).toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              })}
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Cumulé payé</div>
            <div className={`${styles.kpiValue} ${styles.success}`}>
              {parseFloat(data.kpis.cumulPaye || 0).toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              })}
            </div>
            <div className={styles.kpiPercentage}>
              {((data.kpis.cumulPaye / data.kpis.montantMarche) * 100).toFixed(1)}%
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>En attente de paiement</div>
            <div className={`${styles.kpiValue} ${styles.warning}`}>
              {parseFloat(data.kpis.enAttentePaiement || 0).toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              })}
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Reste à facturer</div>
            <div className={`${styles.kpiValue} ${styles.info}`}>
              {parseFloat(data.kpis.resteAFacturer || 0).toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              })}
            </div>
            <div className={styles.kpiPercentage}>
              {((data.kpis.resteAFacturer / data.kpis.montantMarche) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Historique des situations */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Historique des situations</h2>
          <button
            onClick={() => router.push('/dashboard/entreprise/depot-situation')}
            className={styles.primaryButton}
          >
            + Déposer une situation
          </button>
        </div>

        {data.situations && data.situations.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Mois</th>
                  <th>Montant HT cumul</th>
                  <th>Montant HT mois</th>
                  <th>Statut</th>
                  <th>Date de dépôt</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.situations.map(situation => (
                  <tr
                    key={situation.id}
                    className={styles.tableRow}
                    onClick={() => router.push(`/dashboard/entreprise/situations/${situation.id}`)}
                  >
                    <td className={styles.numero}>#{situation.numero}</td>
                    <td>{new Date(situation.mois_reference).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</td>
                    <td className={styles.amount}>
                      {parseFloat(situation.montant_ht_cumul).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </td>
                    <td className={styles.amount}>
                      {parseFloat(situation.montant_ht_mois).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </td>
                    <td>
                      <StatusBadge status={situation.status} />
                    </td>
                    <td>
                      {situation.date_depot ? new Date(situation.date_depot).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td>
                      {['controle_moe', 'certificat_genere'].includes(situation.status) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContester(situation.id);
                          }}
                          className={styles.contestButton}
                        >
                          Contester
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Aucune situation déposée pour le moment.</p>
            <button
              onClick={() => router.push('/dashboard/entreprise/depot-situation')}
              className={styles.secondaryButton}
            >
              Déposer votre première situation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
