'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import GroupementConfig from '@/components/ui/GroupementConfig';
import styles from './groupements.module.css';

export default function GroupementsPage() {
  const params = useParams();
  const operationId = params.id;

  const [groupements, setGroupements] = useState([]);
  const [selectedGroupement, setSelectedGroupement] = useState(null);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupements();
  }, [operationId]);

  const fetchGroupements = async () => {
    try {
      const res = await fetch(`/api/operations/${operationId}/groupements`);
      const data = await res.json();
      setGroupements(data.groupements || []);
    } catch (error) {
      console.error('Erreur fetch groupements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupementDetail = async (groupementId) => {
    try {
      const res = await fetch(`/api/operations/${operationId}/groupements/${groupementId}`);
      const data = await res.json();
      setSelectedGroupement(data.groupement);
      setMembres(data.membres || []);
    } catch (error) {
      console.error('Erreur fetch groupement detail:', error);
    }
  };

  const handleSelectGroupement = (groupement) => {
    fetchGroupementDetail(groupement.id);
  };

  const handleUpdateGroupement = async (updates) => {
    try {
      await fetch(`/api/operations/${operationId}/groupements/${selectedGroupement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      fetchGroupements();
      fetchGroupementDetail(selectedGroupement.id);
      alert('Groupement mis à jour');
    } catch (error) {
      console.error('Erreur update groupement:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Groupements</h1>
        <button className={styles.addButton}>+ Créer un groupement</button>
      </div>

      <div className={styles.content}>
        <div className={styles.list}>
          {groupements.length === 0 ? (
            <div className={styles.empty}>Aucun groupement</div>
          ) : (
            groupements.map(groupement => (
              <div
                key={groupement.id}
                className={`${styles.groupementCard} ${selectedGroupement?.id === groupement.id ? styles.selected : ''}`}
                onClick={() => handleSelectGroupement(groupement)}
              >
                <div className={styles.groupementName}>{groupement.lot_name}</div>
                <div className={styles.groupementInfo}>
                  <span className={styles.groupementType}>
                    {groupement.type === 'solidaire' ? 'Solidaire' : 'Conjoint'}
                  </span>
                  <span className={styles.groupementMandataire}>
                    Mandataire: {groupement.mandataire_name}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedGroupement && (
          <div className={styles.detail}>
            <div className={styles.detailHeader}>
              <h2 className={styles.detailTitle}>Configuration du groupement</h2>
              <span className={styles.detailLot}>{selectedGroupement.lot_name}</span>
            </div>

            <GroupementConfig
              groupement={selectedGroupement}
              membres={membres}
              onUpdate={handleUpdateGroupement}
            />
          </div>
        )}
      </div>
    </div>
  );
}
