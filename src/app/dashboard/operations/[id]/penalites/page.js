'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from './penalites.module.css';
import PlafondGauge from '@/components/ui/PlafondGauge';
import BaremeTable from '@/components/ui/BaremeTable';

export default function PenalitesPage() {
  const params = useParams();
  const [operation, setOperation] = useState(null);
  const [lots, setLots] = useState([]);
  const [baremes, setBaremes] = useState([]);
  const [penalites, setPenalites] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddBareme, setShowAddBareme] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      // Fetch operation
      const opRes = await fetch(`/api/operations/${params.id}`);
      const opData = await opRes.json();
      setOperation(opData.operation);

      // Fetch lots
      const lotsRes = await fetch(`/api/operations/${params.id}/lots`);
      const lotsData = await lotsRes.json();
      setLots(lotsData.lots || []);

      // Fetch barèmes
      const baremesRes = await fetch(`/api/operations/${params.id}/penalite-baremes`);
      const baremesData = await baremesRes.json();
      setBaremes(baremesData.baremes || []);

      // Fetch pénalités per lot
      const penalitesMap = {};
      for (const lot of (lotsData.lots || [])) {
        const penRes = await fetch(`/api/penalites?lot_id=${lot.id}`);
        const penData = await penRes.json();
        penalitesMap[lot.id] = penData.penalites || [];
      }
      setPenalites(penalitesMap);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleAddBareme = async (data) => {
    try {
      await fetch(`/api/operations/${params.id}/penalite-baremes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      fetchData();
      setShowAddBareme(false);
    } catch (error) {
      console.error('Error adding bareme:', error);
    }
  };

  const handleUpdateBareme = async (baremeId, data) => {
    try {
      await fetch(`/api/operations/${params.id}/penalite-baremes/${baremeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      fetchData();
    } catch (error) {
      console.error('Error updating bareme:', error);
    }
  };

  const handleDeleteBareme = async (baremeId) => {
    if (!confirm('Supprimer ce barème ?')) return;

    try {
      await fetch(`/api/operations/${params.id}/penalite-baremes/${baremeId}`, {
        method: 'DELETE'
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting bareme:', error);
    }
  };

  const calculateCumulPenalites = (lotId) => {
    const lotPenalites = penalites[lotId] || [];
    return lotPenalites.reduce((sum, pen) => sum + (pen.montant || 0), 0);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Chargement...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pénalités</h1>
        <p className={styles.subtitle}>
          Gestion des barèmes et calcul automatique des pénalités
        </p>
      </div>

      <div className={styles.info}>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>Plafond CCAG 2021</span>
          <span className={styles.infoValue}>
            Maximum <strong>10%</strong> du montant du marché
          </span>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>Retard (Art. 20.3)</span>
          <span className={styles.infoValue}>
            <strong>1/3000ᵉ</strong> par jour calendaire
          </span>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>Exonération</span>
          <span className={styles.infoValue}>
            Possible sur décision <strong>MOA</strong>
          </span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Barèmes de Pénalités</h2>
          <button
            onClick={() => setShowAddBareme(true)}
            className={styles.addButton}
          >
            + Ajouter un barème
          </button>
        </div>

        {showAddBareme && (
          <div className={styles.addForm}>
            <BaremeTable
              bareme={{
                name: '',
                type: 'retard',
                mode_calcul: 'proportionnel',
                taux_jour: 0.333,
                montant_forfait: 0,
                seuil_jours: 0,
                plafond_pourcent: 10.00,
                exoneration_jours: 0
              }}
              onUpdate={handleAddBareme}
              onDelete={() => setShowAddBareme(false)}
            />
          </div>
        )}

        <div className={styles.baremesTable}>
          <div className={styles.tableHeader}>
            <div className={styles.headerCell}>Nom</div>
            <div className={styles.headerCell}>Type</div>
            <div className={styles.headerCell}>Calcul</div>
            <div className={styles.headerCell}>Seuil</div>
            <div className={styles.headerCell}>Plafond</div>
            <div className={styles.headerCell}>Exonération</div>
            <div className={styles.headerCell}>Actions</div>
          </div>

          {baremes.map(bareme => (
            <BaremeTable
              key={bareme.id}
              bareme={bareme}
              onUpdate={(data) => handleUpdateBareme(bareme.id, data)}
              onDelete={handleDeleteBareme}
            />
          ))}

          {baremes.length === 0 && !showAddBareme && (
            <div className={styles.emptyBaremes}>
              Aucun barème configuré. Cliquez sur "Ajouter un barème" pour commencer.
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Suivi par Lot</h2>

        <div className={styles.lotsGrid}>
          {lots.map(lot => {
            const cumulPenalites = calculateCumulPenalites(lot.id);
            const montantMarche = lot.montant_ht;

            return (
              <div key={lot.id} className={styles.lotCard}>
                <div className={styles.lotCardHeader}>
                  <h3 className={styles.lotCardTitle}>
                    Lot {lot.numero} — {lot.name}
                  </h3>
                  <span className={styles.lotCardMontant}>
                    {montantMarche.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>

                <PlafondGauge
                  cumulPenalites={cumulPenalites}
                  plafond={10}
                  montantMarche={montantMarche}
                />

                <div className={styles.lotPenalites}>
                  <h4 className={styles.lotPenalitesTitle}>
                    Pénalités appliquées ({(penalites[lot.id] || []).length})
                  </h4>

                  {(penalites[lot.id] || []).length > 0 ? (
                    <div className={styles.penalitesList}>
                      {(penalites[lot.id] || []).map(pen => (
                        <div key={pen.id} className={styles.penaliteItem}>
                          <div className={styles.penaliteInfo}>
                            <span className={styles.penaliteType}>{pen.type}</span>
                            <span className={styles.penaliteDate}>
                              {new Date(pen.date_constat).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <span className={styles.penaliteMontant}>
                            {pen.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.noPenalites}>Aucune pénalité appliquée</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {lots.length === 0 && (
          <div className={styles.empty}>
            <p>Aucun lot trouvé pour cette opération.</p>
          </div>
        )}
      </div>
    </div>
  );
}
