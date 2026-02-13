'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './operation.module.css';
import PerformanceCard from '@/components/ui/PerformanceCard';
import ArbitragePanel from '@/components/ui/ArbitragePanel';

export default function MOAOperationDashboard() {
  const router = useRouter();
  const params = useParams();
  const operationId = params.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lots');

  useEffect(() => {
    fetchData();
  }, [operationId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/moa/operations/${operationId}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error fetching operation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateCertificat = async (certificatId) => {
    const codeMaitre = prompt('Entrez votre code MAÎTRE pour valider :');
    if (!codeMaitre) return;

    const comment = prompt('Commentaire (optionnel) :');

    try {
      const res = await fetch(`/api/moa/certificats/${certificatId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code_maitre: codeMaitre, comment })
      });

      if (res.ok) {
        alert('Certificat validé avec succès');
        fetchData();
      } else {
        alert('Erreur lors de la validation');
      }
    } catch (error) {
      console.error('Error validating certificat:', error);
      alert('Erreur lors de la validation');
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

  if (!data) {
    return <div className={styles.error}>Opération non trouvée</div>;
  }

  const { operation, lots, certificats, penalites, contestations, performance } = data;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/dashboard/moa')}>
          ← Retour
        </button>
        <h1 className={styles.title}>{operation.name}</h1>
        <p className={styles.subtitle}>Code : {operation.code} • MOE : {operation.moe_name}</p>
      </div>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <PerformanceCard
          title="Lots"
          value={lots.length}
          color="cyan"
        />
        <PerformanceCard
          title="Certificats en attente"
          value={certificats.length}
          color="gold"
        />
        <PerformanceCard
          title="Pénalités à arbitrer"
          value={penalites.length}
          color="warning"
        />
        <PerformanceCard
          title="Contestations"
          value={contestations.length}
          color="error"
        />
      </div>

      {/* Performance */}
      {performance.nb_situations_traitees > 0 && (
        <div className={styles.performanceSection}>
          <h2 className={styles.sectionTitle}>Performance moyenne</h2>
          <div className={styles.performanceGrid}>
            <div className={styles.performanceItem}>
              <span className={styles.performanceLabel}>Délai OPC</span>
              <span className={styles.performanceValue}>
                {Math.round(performance.avg_duree_opc || 0)}h
              </span>
            </div>
            <div className={styles.performanceItem}>
              <span className={styles.performanceLabel}>Délai MOE</span>
              <span className={styles.performanceValue}>
                {Math.round(performance.avg_duree_moe || 0)}h
              </span>
            </div>
            <div className={styles.performanceItem}>
              <span className={styles.performanceLabel}>Délai MOA</span>
              <span className={styles.performanceValue}>
                {Math.round(performance.avg_duree_moa || 0)}h
              </span>
            </div>
            <div className={styles.performanceItem}>
              <span className={styles.performanceLabel}>Délai total</span>
              <span className={styles.performanceValue}>
                {Math.round(performance.avg_duree_totale || 0)}h
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'lots' ? styles.active : ''}`}
          onClick={() => setActiveTab('lots')}
        >
          Lots ({lots.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'certificats' ? styles.active : ''}`}
          onClick={() => setActiveTab('certificats')}
        >
          Certificats ({certificats.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'penalites' ? styles.active : ''}`}
          onClick={() => setActiveTab('penalites')}
        >
          Pénalités ({penalites.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'contestations' ? styles.active : ''}`}
          onClick={() => setActiveTab('contestations')}
        >
          Contestations ({contestations.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'lots' && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Lot</th>
                <th>Entreprise</th>
                <th>Montant marché</th>
                <th>Situations</th>
                <th>Montant certifié</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot) => (
                <tr key={lot.id}>
                  <td className={styles.lotNum}>{lot.numero} - {lot.name}</td>
                  <td>{lot.entreprise_name}</td>
                  <td className={styles.amount}>{formatCurrency(lot.montant_marche)}</td>
                  <td className={styles.number}>{lot.nb_situations || 0}</td>
                  <td className={styles.amount}>{formatCurrency(lot.montant_total_certificats)}</td>
                  <td>
                    <button
                      className={styles.viewBtn}
                      onClick={() => router.push(`/dashboard/moa/operations/${operationId}/entreprise/${lot.entreprise_id}`)}
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'certificats' && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>N° Certificat</th>
                <th>Lot</th>
                <th>Entreprise</th>
                <th>Montant</th>
                <th>Date signature MOE</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificats.map((cert) => (
                <tr key={cert.id}>
                  <td className={styles.certNum}>{cert.numero_certificat}</td>
                  <td>{cert.lot_numero} - {cert.lot_name}</td>
                  <td>{cert.entreprise_name}</td>
                  <td className={styles.amount}>{formatCurrency(cert.montant_net_a_payer)}</td>
                  <td>{formatDate(cert.date_signature_moe)}</td>
                  <td>
                    <button
                      className={styles.validateBtn}
                      onClick={() => handleValidateCertificat(cert.id)}
                    >
                      Valider
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'penalites' && (
          <div className={styles.arbitrageList}>
            {penalites.map((penalite) => (
              <ArbitragePanel
                key={penalite.id}
                type="penalite"
                data={penalite}
                onDecide={fetchData}
              />
            ))}
            {penalites.length === 0 && (
              <div className={styles.empty}>Aucune pénalité en attente</div>
            )}
          </div>
        )}

        {activeTab === 'contestations' && (
          <div className={styles.arbitrageList}>
            {contestations.map((contestation) => (
              <ArbitragePanel
                key={contestation.id}
                type="contestation"
                data={contestation}
                onDecide={fetchData}
              />
            ))}
            {contestations.length === 0 && (
              <div className={styles.empty}>Aucune contestation en attente</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
