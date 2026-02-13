'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './moe.module.css';
import Timeline from '@/components/ui/Timeline';
import EntrepriseTile from '@/components/ui/EntrepriseTile';
import KPICard from '@/components/ui/KPICard';
import FinancialTable from '@/components/ui/FinancialTable';
import WaterfallChart from '@/components/ui/WaterfallChart';

export default function MOEDashboard() {
  const router = useRouter();
  const [operationId, setOperationId] = useState(1); // Mock
  const [data, setData] = useState(null);
  const [selectedSituation, setSelectedSituation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [operationId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/moe/dashboard?operation_id=${operationId}`);
      const json = await res.json();
      setData(json);
      if (json.situations && json.situations.length > 0) {
        setSelectedSituation(json.situations[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching MOE data:', error);
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!selectedSituation) return;

    const moeMontantValide = parseFloat(prompt('Montant validé (€)', selectedSituation.montant_reclame));
    if (isNaN(moeMontantValide)) return;

    const moeEcartMontant = moeMontantValide - selectedSituation.montant_reclame;

    try {
      const res = await fetch(`/api/moe/situations/${selectedSituation.id}/validate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moe_montant_valide: moeMontantValide, moe_ecart_montant: moeEcartMontant })
      });

      if (res.ok) {
        alert('Situation validée financièrement');
        fetchData();
      }
    } catch (error) {
      console.error('Error validating situation:', error);
    }
  };

  const handleRenvoiOPC = async () => {
    if (!selectedSituation) return;

    const motif = prompt('Motif du renvoi à l\'OPC');
    if (!motif) return;

    try {
      const res = await fetch(`/api/moe/situations/${selectedSituation.id}/renvoi-opc`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motif })
      });

      if (res.ok) {
        alert('Situation renvoyée à l\'OPC');
        fetchData();
      }
    } catch (error) {
      console.error('Error sending back to OPC:', error);
    }
  };

  const handleGenerateCertificat = async () => {
    if (!selectedSituation) return;

    try {
      const res = await fetch(`/api/moe/situations/${selectedSituation.id}/certificat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const json = await res.json();

      if (res.ok) {
        alert('Certificat généré avec succès');
        router.push(`/dashboard/certificats/${json.certificat_id}`);
      }
    } catch (error) {
      console.error('Error generating certificat:', error);
    }
  };

  const mockFinancialData = selectedSituation ? [
    {
      code: '01.01',
      description: 'Terrassement général',
      montantMarche: 50000,
      cumulPrecedent: 25000,
      reclame: 15000,
      valide: 14500,
      ecart: -500,
      status: 'valide'
    },
    {
      code: '01.02',
      description: 'Fondations',
      montantMarche: 80000,
      cumulPrecedent: 40000,
      reclame: 20000,
      valide: 20000,
      ecart: 0,
      status: 'valide'
    }
  ] : [];

  const mockWaterfallData = selectedSituation ? [
    { label: 'Montant marché initial', value: 150000 },
    { label: '+ Avenants', value: 15000 },
    { label: 'Cumul précédent', value: -65000 },
    { label: 'Montant du mois', value: 35000 },
    { label: '- Retenue de garantie', value: -1750 },
    { label: '- Pénalités', value: -500 },
    { label: 'Net à payer', value: 32750 }
  ] : [];

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  if (!data) {
    return <div className={styles.error}>Erreur de chargement</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Contrôle MOE</h1>
        <p className={styles.subtitle}>Validation financière</p>
      </div>

      <Timeline currentStep="moe" />

      <div className={styles.kpiGrid}>
        <KPICard 
          label="Montant total marché"
          value={(data.kpis?.montant_total_marches / 1000000).toFixed(2)}
          unit="M€"
          color="gold"
          icon="💰"
        />
        <KPICard 
          label="Montant total payé"
          value={(data.kpis?.montant_total_paye / 1000000).toFixed(2)}
          unit="M€"
          color="cyan"
          icon="✓"
        />
        <KPICard 
          label="Situations en attente"
          value={data.situations?.length || 0}
          color="warning"
          icon="⏳"
        />
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Lots en attente</h3>
          {data.situations && data.situations.length > 0 ? (
            data.situations.map((sit) => (
              <EntrepriseTile
                key={sit.id}
                lotNumero={sit.lot_numero}
                entrepriseName={sit.entreprise_nom}
                status="violet"
                avancement={sit.opc_avancement_valide || sit.avancement_physique}
                isActive={selectedSituation?.id === sit.id}
                onClick={() => setSelectedSituation(sit)}
              />
            ))
          ) : (
            <p className={styles.emptyState}>Aucune situation en attente</p>
          )}
        </div>

        <div className={styles.mainContent}>
          {selectedSituation ? (
            <>
              <div className={styles.situationHeader}>
                <h2>Lot {selectedSituation.lot_numero} — {selectedSituation.lot_nom}</h2>
                <span className={styles.entreprise}>{selectedSituation.entreprise_nom}</span>
              </div>

              <div className={styles.section}>
                <h3>Décomposition financière</h3>
                <FinancialTable data={mockFinancialData} />
              </div>

              <div className={styles.section}>
                <h3>Calcul du certificat</h3>
                <WaterfallChart data={mockWaterfallData} />
              </div>

              <div className={styles.actions}>
                <button onClick={handleValidate} className={`${styles.btn} ${styles.btnSuccess}`}>
                  ✓ Valider financièrement
                </button>
                <button onClick={handleGenerateCertificat} className={`${styles.btn} ${styles.btnPrimary}`}>
                  📄 Générer le certificat
                </button>
                <button onClick={handleRenvoiOPC} className={`${styles.btn} ${styles.btnWarning}`}>
                  ↩ Renvoyer à l'OPC
                </button>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              Sélectionnez une situation dans la liste
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
