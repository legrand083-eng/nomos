'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import STDocChecklist from '@/components/ui/STDocChecklist';
import AgrementTimeline from '@/components/ui/AgrementTimeline';
import styles from './soustraitants.module.css';

export default function SousTraitantsPage() {
  const params = useParams();
  const operationId = params.id;

  const [soustraitants, setSoustraitants] = useState([]);
  const [selectedST, setSelectedST] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSousTraitants();
  }, [operationId]);

  const fetchSousTraitants = async () => {
    try {
      const res = await fetch(`/api/operations/${operationId}/sous-traitants`);
      const data = await res.json();
      setSoustraitants(data.soustraitants || []);
    } catch (error) {
      console.error('Erreur fetch sous-traitants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (stId) => {
    try {
      const res = await fetch(`/api/operations/${operationId}/sous-traitants/${stId}/documents`);
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Erreur fetch documents:', error);
    }
  };

  const handleSelectST = (st) => {
    setSelectedST(st);
    fetchDocuments(st.id);
  };

  const handleUploadDocument = async (type, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();

      await fetch(`/api/operations/${operationId}/sous-traitants/${selectedST.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          file_path: uploadData.file_path
        })
      });

      fetchDocuments(selectedST.id);
    } catch (error) {
      console.error('Erreur upload document:', error);
      alert('Erreur lors de l\'upload du document');
    }
  };

  const handleDeleteDocument = async (type) => {
    const doc = documents.find(d => d.type === type);
    if (!doc) return;

    try {
      await fetch(`/api/operations/${operationId}/sous-traitants/${selectedST.id}/documents/${doc.id}`, {
        method: 'DELETE'
      });
      fetchDocuments(selectedST.id);
    } catch (error) {
      console.error('Erreur delete document:', error);
    }
  };

  const handleAgrementAction = async (action) => {
    try {
      await fetch(`/api/operations/${operationId}/sous-traitants/${selectedST.id}/agrement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      fetchSousTraitants();
      const updatedST = soustraitants.find(s => s.id === selectedST.id);
      if (updatedST) {
        setSelectedST({ ...updatedST });
      }
    } catch (error) {
      console.error('Erreur action agrément:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Sous-traitants</h1>
        <button className={styles.addButton}>+ Ajouter un sous-traitant</button>
      </div>

      <div className={styles.content}>
        <div className={styles.list}>
          {soustraitants.length === 0 ? (
            <div className={styles.empty}>Aucun sous-traitant</div>
          ) : (
            soustraitants.map(st => (
              <div
                key={st.id}
                className={`${styles.stCard} ${selectedST?.id === st.id ? styles.selected : ''}`}
                onClick={() => handleSelectST(st)}
              >
                <div className={styles.stName}>{st.name}</div>
                <div className={styles.stInfo}>
                  <span className={styles.stLot}>{st.lot_name}</span>
                  <span className={styles.stMontant}>{st.montant_ht.toLocaleString('fr-FR')} € HT</span>
                </div>
                <div className={`${styles.stStatus} ${styles[st.agrement_status]}`}>
                  {st.agrement_status === 'en_attente' && 'En attente'}
                  {st.agrement_status === 'soumis_moe' && 'Soumis MOE'}
                  {st.agrement_status === 'valide_moe' && 'Validé MOE'}
                  {st.agrement_status === 'soumis_moa' && 'Soumis MOA'}
                  {st.agrement_status === 'agree' && 'Agréé'}
                  {st.agrement_status === 'refuse' && 'Refusé'}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedST && (
          <div className={styles.detail}>
            <div className={styles.detailHeader}>
              <h2 className={styles.detailTitle}>{selectedST.name}</h2>
              <span className={styles.detailSiret}>SIRET: {selectedST.siret}</span>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Workflow d'agrément</h3>
              <AgrementTimeline
                status={selectedST.agrement_status}
                dates={{
                  soumis_moe: selectedST.date_soumission,
                  valide_moe: selectedST.date_agrement_moe,
                  agree: selectedST.date_agrement_moa
                }}
                delaiJours={selectedST.agrement_delai_jours}
              />

              <div className={styles.actions}>
                {selectedST.agrement_status === 'en_attente' && (
                  <button
                    className={styles.actionButton}
                    onClick={() => handleAgrementAction('soumettre_moe')}
                  >
                    Soumettre au MOE
                  </button>
                )}
                {selectedST.agrement_status === 'soumis_moe' && (
                  <button
                    className={styles.actionButton}
                    onClick={() => handleAgrementAction('valider_moe')}
                  >
                    Valider (MOE)
                  </button>
                )}
                {selectedST.agrement_status === 'valide_moe' && (
                  <button
                    className={styles.actionButton}
                    onClick={() => handleAgrementAction('soumettre_moa')}
                  >
                    Soumettre au MOA
                  </button>
                )}
                {selectedST.agrement_status === 'soumis_moa' && (
                  <button
                    className={styles.actionButton}
                    onClick={() => handleAgrementAction('agreer')}
                  >
                    Agréer (MOA)
                  </button>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Documents DC4</h3>
              <STDocChecklist
                documents={documents}
                onUpload={handleUploadDocument}
                onDelete={handleDeleteDocument}
                readonly={selectedST.agrement_status === 'agree'}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
