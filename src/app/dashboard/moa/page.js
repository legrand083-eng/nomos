'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './moa.module.css';
import PerformanceCard from '@/components/ui/PerformanceCard';

export default function MOADashboard() {
  const router = useRouter();
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperations();
  }, []);

  const fetchOperations = async () => {
    try {
      const res = await fetch('/api/moa/operations');
      const data = await res.json();
      setOperations(data.operations || []);
    } catch (error) {
      console.error('Error fetching operations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard Maître d'Ouvrage</h1>
        <p className={styles.subtitle}>Vue d'ensemble de toutes les opérations</p>
      </div>

      <div className={styles.kpiGrid}>
        <PerformanceCard
          title="Opérations actives"
          value={operations.filter(o => o.status === 'en_cours').length}
          color="cyan"
        />
        <PerformanceCard
          title="Certificats en attente"
          value={operations.reduce((sum, o) => sum + (o.nb_certificats_pending || 0), 0)}
          color="gold"
        />
        <PerformanceCard
          title="Montant total"
          value={formatCurrency(operations.reduce((sum, o) => sum + (o.montant_total_certificats || 0), 0))}
          color="green"
        />
        <PerformanceCard
          title="Situations en cours"
          value={operations.reduce((sum, o) => sum + (o.nb_situations_pending || 0), 0)}
          color="cyan"
        />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Nom de l'opération</th>
              <th>MOE</th>
              <th>Statut</th>
              <th>Lots</th>
              <th>Entreprises</th>
              <th>Certificats en attente</th>
              <th>Montant total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {operations.map((operation) => (
              <tr key={operation.id}>
                <td className={styles.code}>{operation.code}</td>
                <td className={styles.name}>{operation.name}</td>
                <td>{operation.moe_name}</td>
                <td>
                  <span className={styles.badge} data-status={operation.status}>
                    {operation.status}
                  </span>
                </td>
                <td className={styles.number}>{operation.nb_lots || 0}</td>
                <td className={styles.number}>{operation.nb_entreprises || 0}</td>
                <td className={styles.number}>
                  {operation.nb_certificats_pending > 0 && (
                    <span className={styles.alert}>{operation.nb_certificats_pending}</span>
                  )}
                  {operation.nb_certificats_pending === 0 && '—'}
                </td>
                <td className={styles.amount}>
                  {formatCurrency(operation.montant_total_certificats)}
                </td>
                <td>
                  <button
                    className={styles.viewBtn}
                    onClick={() => router.push(`/dashboard/moa/operations/${operation.id}`)}
                  >
                    Voir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {operations.length === 0 && (
          <div className={styles.empty}>Aucune opération trouvée</div>
        )}
      </div>
    </div>
  );
}
