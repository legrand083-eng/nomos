'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from './avances.module.css';
import AvanceCard from '@/components/ui/AvanceCard';
import RemboursementProgress from '@/components/ui/RemboursementProgress';

export default function AvancesPage() {
  const params = useParams();
  const [lots, setLots] = useState([]);
  const [avances, setAvances] = useState({});
  const [situations, setSituations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      // Fetch lots
      const lotsRes = await fetch(`/api/operations/${params.id}/lots`);
      const lotsData = await lotsRes.json();
      setLots(lotsData.lots || []);

      // Fetch avances
      const avancesRes = await fetch(`/api/operations/${params.id}/avances`);
      const avancesData = await avancesRes.json();
      
      const avancesMap = {};
      (avancesData.avances || []).forEach(av => {
        avancesMap[av.lot_id] = av;
      });
      setAvances(avancesMap);

      // Fetch situations per lot
      const situationsMap = {};
      for (const lot of (lotsData.lots || [])) {
        const sitRes = await fetch(`/api/operations/${params.id}/situations?lot_id=${lot.id}`);
        const sitData = await sitRes.json();
        situationsMap[lot.id] = sitData.situations || [];
      }
      setSituations(situationsMap);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleUpdateAvance = async (lotId, data) => {
    try {
      const avance = avances[lotId];
      
      if (avance) {
        await fetch(`/api/operations/${params.id}/avances/${lotId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        await fetch(`/api/operations/${params.id}/avances`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, lot_id: lotId })
        });
      }

      fetchData();
    } catch (error) {
      console.error('Error updating avance:', error);
    }
  };

  const handleVerserAvance = async (lotId) => {
    try {
      await fetch(`/api/operations/${params.id}/avances/${lotId}/verser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date_versement: new Date().toISOString() })
      });

      fetchData();
    } catch (error) {
      console.error('Error versing avance:', error);
    }
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
        <h1 className={styles.title}>Avances</h1>
        <p className={styles.subtitle}>
          Gestion des avances forfaitaires et sur approvisionnements
        </p>
      </div>

      <div className={styles.info}>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>Avances forfaitaires</span>
          <span className={styles.infoValue}>
            Taux maximum : <strong>5% TTC</strong> (CCAG 2021)
          </span>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>Remboursement</span>
          <span className={styles.infoValue}>
            Seuils par défaut : <strong>65% → 80%</strong>
          </span>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>Approvisionnements</span>
          <span className={styles.infoValue}>
            Taux maximum : <strong>95%</strong> de la valeur
          </span>
        </div>
      </div>

      <div className={styles.lots}>
        {lots.map(lot => (
          <div key={lot.id} className={styles.lotSection}>
            <div className={styles.lotHeader}>
              <h2 className={styles.lotTitle}>
                Lot {lot.numero} — {lot.name}
              </h2>
              <span className={styles.lotMontant}>
                {lot.montant_ht.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € HT
              </span>
            </div>

            <div className={styles.lotContent}>
              <AvanceCard
                avance={avances[lot.id]}
                lot={lot}
                onUpdate={(data) => handleUpdateAvance(lot.id, data)}
                onVerser={() => handleVerserAvance(lot.id)}
              />

              {avances[lot.id] && avances[lot.id].status !== 'non_demandee' && (
                <RemboursementProgress
                  avance={avances[lot.id]}
                  situations={situations[lot.id]}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {lots.length === 0 && (
        <div className={styles.empty}>
          <p>Aucun lot trouvé pour cette opération.</p>
        </div>
      )}
    </div>
  );
}
