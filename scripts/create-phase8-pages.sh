#!/bin/bash

# ══════════════════════════════════════════════════════════════
# NOMOΣ — Phase 8 : Pages Generator
# Génère les 2 pages principales (Sous-traitants + Groupements)
# ══════════════════════════════════════════════════════════════

cd /home/ubuntu/nomos

# ═══════════════════════════════════════════════════════════
# PAGE 1/2 : SOUS-TRAITANTS
# ═══════════════════════════════════════════════════════════

cat > src/app/dashboard/operations/[id]/sous-traitants/page.js << 'EOFPAGE'
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
EOFPAGE

cat > src/app/dashboard/operations/[id]/sous-traitants/soustraitants.module.css << 'EOFCSS'
.container {
  padding: var(--spacing-34);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-34);
}

.title {
  font-family: var(--font-brand);
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.addButton {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  padding: var(--spacing-13) var(--spacing-21);
  background: var(--cyan);
  color: var(--navy);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.addButton:hover {
  background: #00d4e6;
}

.content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--spacing-34);
}

.list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-13);
}

.stCard {
  padding: var(--spacing-21);
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.stCard:hover {
  border-color: var(--cyan);
}

.stCard.selected {
  border-color: var(--gold);
  background: var(--bg-tertiary);
}

.stName {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-8);
}

.stInfo {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-13);
}

.stLot {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text-secondary);
}

.stMontant {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.stStatus {
  padding: var(--spacing-5) var(--spacing-13);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.stStatus.en_attente {
  background: rgba(156, 163, 175, 0.2);
  color: var(--text-secondary);
}

.stStatus.soumis_moe,
.stStatus.soumis_moa {
  background: rgba(0, 238, 255, 0.2);
  color: var(--cyan);
}

.stStatus.valide_moe {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning);
}

.stStatus.agree {
  background: rgba(34, 197, 94, 0.2);
  color: var(--success);
}

.stStatus.refuse {
  background: rgba(239, 68, 68, 0.2);
  color: var(--error);
}

.detail {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-34);
}

.detailHeader {
  margin-bottom: var(--spacing-34);
}

.detailTitle {
  font-family: var(--font-body);
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-8) 0;
}

.detailSiret {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-secondary);
}

.section {
  margin-bottom: var(--spacing-34);
}

.sectionTitle {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-21) 0;
}

.actions {
  margin-top: var(--spacing-21);
  display: flex;
  gap: var(--spacing-13);
}

.actionButton {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  padding: var(--spacing-13) var(--spacing-21);
  background: var(--gold);
  color: var(--navy);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.actionButton:hover {
  background: #b89420;
}

.loading,
.empty {
  padding: var(--spacing-34);
  text-align: center;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-secondary);
}

:global(.dark) .container {
  background: var(--bg-primary-dark);
}

:global(.dark) .title {
  color: var(--text-primary-dark);
}

:global(.dark) .stCard {
  background: var(--bg-secondary-dark);
  border-color: var(--border-color-dark);
}

:global(.dark) .stName {
  color: var(--text-primary-dark);
}

:global(.dark) .stLot {
  color: var(--text-secondary-dark);
}

:global(.dark) .stMontant {
  color: var(--text-primary-dark);
}

:global(.dark) .detail {
  background: var(--bg-secondary-dark);
  border-color: var(--border-color-dark);
}

:global(.dark) .detailTitle {
  color: var(--text-primary-dark);
}

:global(.dark) .detailSiret {
  color: var(--text-secondary-dark);
}

:global(.dark) .sectionTitle {
  color: var(--text-primary-dark);
}

@media (max-width: 1024px) {
  .content {
    grid-template-columns: 1fr;
  }
}
EOFCSS

# ═══════════════════════════════════════════════════════════
# PAGE 2/2 : GROUPEMENTS
# ═══════════════════════════════════════════════════════════

cat > src/app/dashboard/operations/[id]/groupements/page.js << 'EOFPAGE'
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
EOFPAGE

cat > src/app/dashboard/operations/[id]/groupements/groupements.module.css << 'EOFCSS'
.container {
  padding: var(--spacing-34);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-34);
}

.title {
  font-family: var(--font-brand);
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.addButton {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  padding: var(--spacing-13) var(--spacing-21);
  background: var(--cyan);
  color: var(--navy);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.addButton:hover {
  background: #00d4e6;
}

.content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--spacing-34);
}

.list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-13);
}

.groupementCard {
  padding: var(--spacing-21);
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.groupementCard:hover {
  border-color: var(--cyan);
}

.groupementCard.selected {
  border-color: var(--gold);
  background: var(--bg-tertiary);
}

.groupementName {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-13);
}

.groupementInfo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.groupementType {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  color: var(--gold);
}

.groupementMandataire {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text-secondary);
}

.detail {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-34);
}

.detailHeader {
  margin-bottom: var(--spacing-34);
}

.detailTitle {
  font-family: var(--font-body);
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-8) 0;
}

.detailLot {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-secondary);
}

.loading,
.empty {
  padding: var(--spacing-34);
  text-align: center;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-secondary);
}

:global(.dark) .container {
  background: var(--bg-primary-dark);
}

:global(.dark) .title {
  color: var(--text-primary-dark);
}

:global(.dark) .groupementCard {
  background: var(--bg-secondary-dark);
  border-color: var(--border-color-dark);
}

:global(.dark) .groupementName {
  color: var(--text-primary-dark);
}

:global(.dark) .groupementMandataire {
  color: var(--text-secondary-dark);
}

:global(.dark) .detail {
  background: var(--bg-secondary-dark);
  border-color: var(--border-color-dark);
}

:global(.dark) .detailTitle {
  color: var(--text-primary-dark);
}

:global(.dark) .detailLot {
  color: var(--text-secondary-dark);
}

@media (max-width: 1024px) {
  .content {
    grid-template-columns: 1fr;
  }
}
EOFCSS

echo "✅ Phase 8 — Pages créées (2/2)"
echo "Fichiers créés :"
echo "  - src/app/dashboard/operations/[id]/sous-traitants/page.js + .module.css"
echo "  - src/app/dashboard/operations/[id]/groupements/page.js + .module.css"
