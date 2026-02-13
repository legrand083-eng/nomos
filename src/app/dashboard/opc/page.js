'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './opc.module.css';
import BreakingNewsBanner from '@/components/ui/BreakingNewsBanner';
import Timeline from '@/components/ui/Timeline';
import EntrepriseTile from '@/components/ui/EntrepriseTile';
import KPICard from '@/components/ui/KPICard';
import GaugeCircle from '@/components/ui/GaugeCircle';
import PenaltyForm from '@/components/ui/PenaltyForm';
import CourrierModal from '@/components/ui/CourrierModal';

export default function OPCDashboard() {
  const router = useRouter();
  const [operationId, setOperationId] = useState(1); // Mock
  const [data, setData] = useState(null);
  const [selectedSituation, setSelectedSituation] = useState(null);
  const [showPenaltyForm, setShowPenaltyForm] = useState(false);
  const [showCourrierModal, setShowCourrierModal] = useState(false);
  const [courrierType, setCourrierType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [operationId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/opc/dashboard?operation_id=${operationId}`);
      const json = await res.json();
      setData(json);
      if (json.situations && json.situations.length > 0) {
        setSelectedSituation(json.situations[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching OPC data:', error);
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!selectedSituation) return;

    const opcAvancementValide = parseFloat(prompt('Avancement validé (%)', selectedSituation.avancement_physique));
    if (isNaN(opcAvancementValide)) return;

    const opcEcartPlanning = opcAvancementValide - selectedSituation.avancement_physique;

    try {
      const res = await fetch(`/api/opc/situations/${selectedSituation.id}/validate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opc_avancement_valide: opcAvancementValide, opc_ecart_planning: opcEcartPlanning })
      });

      if (res.ok) {
        alert('Situation validée et transmise au MOE');
        fetchData();
      }
    } catch (error) {
      console.error('Error validating situation:', error);
    }
  };

  const handleRefuse = async () => {
    if (!selectedSituation) return;

    const motif = prompt('Motif du refus');
    if (!motif) return;

    try {
      const res = await fetch(`/api/opc/situations/${selectedSituation.id}/refuse`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motif })
      });

      if (res.ok) {
        alert('Situation refusée');
        fetchData();
      }
    } catch (error) {
      console.error('Error refusing situation:', error);
    }
  };

  const handleDemandComplement = async () => {
    if (!selectedSituation) return;

    const motif = prompt('Compléments requis');
    if (!motif) return;

    try {
      const res = await fetch(`/api/opc/situations/${selectedSituation.id}/complement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motif })
      });

      if (res.ok) {
        alert('Demande de complément envoyée');
        fetchData();
      }
    } catch (error) {
      console.error('Error requesting complement:', error);
    }
  };

  const handleProposePenalty = async (formData) => {
    try {
      const res = await fetch('/api/opc/penalites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          operation_id: operationId,
          lot_id: selectedSituation.lot_id,
          entreprise_id: selectedSituation.entreprise_id,
          situation_id: selectedSituation.id
        })
      });

      if (res.ok) {
        alert('Pénalité proposée au MOA');
        setShowPenaltyForm(false);
      }
    } catch (error) {
      console.error('Error proposing penalty:', error);
    }
  };

  const handleSendCourrier = async (formData) => {
    try {
      const res = await fetch('/api/courriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          operation_id: operationId,
          lot_id: selectedSituation.lot_id,
          entreprise_id: selectedSituation.entreprise_id,
          situation_id: selectedSituation.id,
          type: courrierType
        })
      });

      if (res.ok) {
        alert('Courrier envoyé');
        setShowCourrierModal(false);
      }
    } catch (error) {
      console.error('Error sending courrier:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  if (!data) {
    return <div className={styles.error}>Erreur de chargement</div>;
  }

  return (
    <div className={styles.container}>
      <BreakingNewsBanner news={data.news || []} />

      <div className={styles.header}>
        <h1 className={styles.title}>Contrôle OPC</h1>
        <p className={styles.subtitle}>{data.operation?.nom || 'Opération TOTEM'}</p>
      </div>

      <Timeline currentStep="opc" />

      <div className={styles.kpiGrid}>
        <KPICard 
          label="Avancement global"
          value={data.kpis?.avancement_global?.toFixed(1) || '0.0'}
          unit="%"
          color="gold"
          icon="📊"
        />
        <KPICard 
          label="Situations en attente"
          value={data.kpis?.pending_count || 0}
          color="warning"
          icon="⏳"
        />
        <GaugeCircle 
          value={data.kpis?.avancement_global || 0}
          max={100}
          label="Progression chantier"
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
                avancement={sit.avancement_physique}
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

              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <label>Avancement déclaré</label>
                  <div className={styles.value}>{selectedSituation.avancement_physique}%</div>
                </div>
                <div className={styles.infoCard}>
                  <label>Montant réclamé</label>
                  <div className={styles.value}>
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedSituation.montant_reclame)}
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <label>Date de dépôt</label>
                  <div className={styles.value}>
                    {new Date(selectedSituation.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button onClick={handleValidate} className={`${styles.btn} ${styles.btnSuccess}`}>
                  ✓ Valider et transmettre au MOE
                </button>
                <button onClick={handleDemandComplement} className={`${styles.btn} ${styles.btnWarning}`}>
                  📄 Demander un complément
                </button>
                <button onClick={handleRefuse} className={`${styles.btn} ${styles.btnDanger}`}>
                  ✗ Refuser définitivement
                </button>
                <button onClick={() => setShowPenaltyForm(true)} className={`${styles.btn} ${styles.btnSecondary}`}>
                  ⚠️ Proposer une pénalité
                </button>
                <button 
                  onClick={() => { setCourrierType('opc_validation'); setShowCourrierModal(true); }} 
                  className={`${styles.btn} ${styles.btnSecondary}`}
                >
                  ✉️ Envoyer un courrier
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

      {showPenaltyForm && (
        <PenaltyForm 
          onSubmit={handleProposePenalty}
          onCancel={() => setShowPenaltyForm(false)}
        />
      )}

      {showCourrierModal && (
        <CourrierModal 
          type={courrierType}
          onSubmit={handleSendCourrier}
          onCancel={() => setShowCourrierModal(false)}
        />
      )}
    </div>
  );
}
