'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './revision.module.css';
import FormulaDisplay from '@/components/ui/FormulaDisplay';
import RevisionSimulator from '@/components/ui/RevisionSimulator';
import IndiceChart from '@/components/ui/IndiceChart';
import { getAvailableIndices } from '@/lib/revision-engine';

export default function RevisionPage() {
  const params = useParams();
  const router = useRouter();
  const operationId = params.id;

  const [lots, setLots] = useState([]);
  const [formules, setFormules] = useState({});
  const [selectedLot, setSelectedLot] = useState(null);
  const [currentFormule, setCurrentFormule] = useState(null);
  const [indicesHistory, setIndicesHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const availableIndices = getAvailableIndices();

  useEffect(() => {
    fetchData();
  }, [operationId]);

  const fetchData = async () => {
    try {
      // Fetch lots
      const lotsRes = await fetch(`/api/operations/${operationId}/lots`);
      if (lotsRes.ok) {
        const lotsData = await lotsRes.json();
        setLots(lotsData.lots || []);
        if (lotsData.lots.length > 0) {
          setSelectedLot(lotsData.lots[0]);
        }
      }

      // Fetch formules
      const formulesRes = await fetch(`/api/operations/${operationId}/revision`);
      if (formulesRes.ok) {
        const formulesData = await formulesRes.json();
        const formulesMap = {};
        formulesData.formules.forEach(f => {
          formulesMap[f.lot_id] = f;
        });
        setFormules(formulesMap);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLot) {
      const formule = formules[selectedLot.id] || {
        type: 'mono_indice',
        indice_code: 'BT01',
        indice_base_value: 125.6,
        mois_reference: '2024-03-01',
        partie_fixe: 0.15,
        partie_variable: 0.85,
        has_butoir: true,
        butoir_pourcent: 15.00,
        has_sauvegarde: false,
        sauvegarde_seuil: 20.00,
        revision_negative_applicable: true,
        validated: false
      };
      setCurrentFormule(formule);

      // Fetch indices history for chart
      fetchIndicesHistory(formule.indice_code);
    }
  }, [selectedLot, formules]);

  const fetchIndicesHistory = async (code) => {
    try {
      // For now, we use sample data
      // In real implementation, we'd fetch from /api/indices?code={code}&range=12months
      const sampleData = [];
      const baseValue = 124.2;
      for (let i = 0; i < 18; i++) {
        const date = new Date('2024-01-01');
        date.setMonth(date.getMonth() + i);
        sampleData.push({
          mois: date.toISOString().slice(0, 10),
          valeur: baseValue + i * 0.3
        });
      }
      setIndicesHistory(sampleData);
    } catch (error) {
      console.error('Error fetching indices history:', error);
    }
  };

  const handleFormulaChange = (updates) => {
    setCurrentFormule(prev => ({ ...prev, ...updates }));
  };

  const handleFieldChange = (field, value) => {
    setCurrentFormule(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selectedLot || !currentFormule) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/operations/${operationId}/revision/${selectedLot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentFormule)
      });

      if (res.ok) {
        alert('Formule de révision enregistrée avec succès');
        fetchData();
      } else {
        const error = await res.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving formula:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Configuration Révision de Prix</h1>
        <p className={styles.subtitle}>
          Configurer les formules de révision par lot selon les indices INSEE (BT/TP)
        </p>
      </div>

      <div className={styles.lotSelector}>
        {lots.map(lot => (
          <button
            key={lot.id}
            className={`${styles.lotButton} ${selectedLot?.id === lot.id ? styles.active : ''}`}
            onClick={() => setSelectedLot(lot)}
          >
            <span className={styles.lotNumero}>Lot {lot.numero}</span>
            <span className={styles.lotNom}>{lot.nom}</span>
            {formules[lot.id]?.validated && (
              <span className={styles.validatedBadge}>✓</span>
            )}
          </button>
        ))}
      </div>

      {selectedLot && currentFormule && (
        <div className={styles.content}>
          <div className={styles.column}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Type de formule</h2>
              <select
                value={currentFormule.type}
                onChange={(e) => handleFieldChange('type', e.target.value)}
                className={styles.select}
              >
                <option value="mono_indice">Mono-indice</option>
                <option value="parametrique">Paramétrique (multi-indices)</option>
                <option value="personnalisee">Personnalisée</option>
              </select>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Indice de référence</h2>
              <select
                value={currentFormule.indice_code}
                onChange={(e) => handleFieldChange('indice_code', e.target.value)}
                className={styles.select}
              >
                {availableIndices.map(idx => (
                  <option key={idx.code} value={idx.code}>{idx.label}</option>
                ))}
              </select>

              <label className={styles.label}>
                Mois de référence (M0)
                <input
                  type="month"
                  value={currentFormule.mois_reference?.slice(0, 7)}
                  onChange={(e) => handleFieldChange('mois_reference', e.target.value + '-01')}
                  className={styles.input}
                />
              </label>

              <label className={styles.label}>
                Valeur de l'indice de base (BT₀)
                <input
                  type="number"
                  step="0.1"
                  value={currentFormule.indice_base_value}
                  onChange={(e) => handleFieldChange('indice_base_value', parseFloat(e.target.value))}
                  className={styles.input}
                />
              </label>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Formule de révision</h2>
              <FormulaDisplay
                formule={currentFormule}
                onChange={handleFormulaChange}
              />
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Clauses</h2>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={currentFormule.has_butoir}
                  onChange={(e) => handleFieldChange('has_butoir', e.target.checked)}
                />
                <span>Clause butoir (plafonnement de la révision)</span>
              </label>

              {currentFormule.has_butoir && (
                <label className={styles.label}>
                  Plafond (%)
                  <input
                    type="number"
                    step="0.01"
                    value={currentFormule.butoir_pourcent}
                    onChange={(e) => handleFieldChange('butoir_pourcent', parseFloat(e.target.value))}
                    className={styles.input}
                  />
                </label>
              )}

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={currentFormule.has_sauvegarde}
                  onChange={(e) => handleFieldChange('has_sauvegarde', e.target.checked)}
                />
                <span>Clause de sauvegarde</span>
              </label>

              {currentFormule.has_sauvegarde && (
                <label className={styles.label}>
                  Seuil de déclenchement (%)
                  <input
                    type="number"
                    step="0.01"
                    value={currentFormule.sauvegarde_seuil}
                    onChange={(e) => handleFieldChange('sauvegarde_seuil', parseFloat(e.target.value))}
                    className={styles.input}
                  />
                </label>
              )}

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={currentFormule.revision_negative_applicable}
                  onChange={(e) => handleFieldChange('revision_negative_applicable', e.target.checked)}
                />
                <span>Révision négative applicable</span>
              </label>
            </div>

            <div className={styles.actions}>
              <button
                onClick={handleSave}
                disabled={saving}
                className={styles.saveButton}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer la formule'}
              </button>

              <button
                onClick={() => handleFieldChange('validated', !currentFormule.validated)}
                className={`${styles.validateButton} ${currentFormule.validated ? styles.validated : ''}`}
              >
                {currentFormule.validated ? '✓ Formule validée' : 'Valider la formule'}
              </button>
            </div>
          </div>

          <div className={styles.column}>
            <div className={styles.card}>
              <RevisionSimulator
                formule={currentFormule}
                indiceBase={currentFormule.indice_base_value}
                indiceMois={indicesHistory[indicesHistory.length - 1]?.valeur || currentFormule.indice_base_value}
              />
            </div>

            <div className={styles.card}>
              <IndiceChart
                data={indicesHistory}
                indiceBase={currentFormule.indice_base_value}
                moisReference={currentFormule.mois_reference}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
