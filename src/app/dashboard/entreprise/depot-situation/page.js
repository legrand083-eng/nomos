'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Stepper from '@/components/ui/Stepper';
import CurrencyInput from '@/components/ui/CurrencyInput';
import FileUpload from '@/components/ui/FileUpload';
import styles from './depot.module.css';

export default function DepotSituationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState({});
  const [formData, setFormData] = useState({
    montant_ht_cumul: 0,
    montant_ht_mois: 0,
    montant_st_ht: 0,
    commentaire: '',
    sousTraitants: []
  });
  const [files, setFiles] = useState({
    situation_pdf: null,
    facture_pdf: null
  });

  const steps = [
    { title: 'Vérifications', description: 'Contrôles préalables' },
    { title: 'Documents', description: 'Upload PDF' },
    { title: 'Montants', description: 'Détail financier' },
    { title: 'Confirmation', description: 'Récapitulatif' }
  ];

  useEffect(() => {
    performChecks();
  }, []);

  const performChecks = async () => {
    try {
      // Mock data - replace with actual API call
      const res = await fetch('/api/operations/1/situations/checks?entreprise_id=1&lot_id=3');
      const data = await res.json();
      setChecks(data.checks || {});
    } catch (error) {
      console.error('Error performing checks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !checks.canDeposit) {
      alert('Vous ne pouvez pas déposer de situation pour le moment. Veuillez corriger les points bloquants.');
      return;
    }

    if (currentStep === 2) {
      if (!files.situation_pdf || !files.facture_pdf) {
        alert('Veuillez uploader les 2 documents obligatoires');
        return;
      }
    }

    if (currentStep === 3) {
      if (!formData.montant_ht_cumul || !formData.montant_ht_mois) {
        alert('Veuillez renseigner les montants obligatoires');
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = async () => {
    try {
      // Create situation
      const createRes = await fetch('/api/operations/1/situations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lot_id: 3,
          entreprise_id: 1,
          mois_reference: new Date().toISOString().split('T')[0],
          ...formData
        })
      });

      const createData = await createRes.json();
      const situationId = createData.id;

      // Confirm deposit
      await fetch(`/api/operations/1/situations/${situationId}/confirm`, {
        method: 'POST'
      });

      alert('Situation déposée avec succès !');
      router.push('/dashboard/entreprise');
    } catch (error) {
      alert('Erreur lors du dépôt de la situation');
    }
  };

  const addSousTraitant = () => {
    setFormData({
      ...formData,
      sousTraitants: [
        ...formData.sousTraitants,
        { name: '', siret: '', montant_ht: 0 }
      ]
    });
  };

  const removeSousTraitant = (index) => {
    const newST = formData.sousTraitants.filter((_, i) => i !== index);
    setFormData({ ...formData, sousTraitants: newST });
  };

  const updateSousTraitant = (index, field, value) => {
    const newST = [...formData.sousTraitants];
    newST[index][field] = value;
    setFormData({ ...formData, sousTraitants: newST });
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dépôt de Situation</h1>
        <p className={styles.subtitle}>Lot 03 — Gros Œuvre</p>
      </div>

      <Stepper steps={steps} currentStep={currentStep} />

      <div className={styles.content}>
        {/* STEP 1: CHECKS */}
        {currentStep === 1 && (
          <div className={styles.step}>
            <h2 className={styles.stepTitle}>Vérifications préalables</h2>
            <p className={styles.stepDescription}>
              Les 4 conditions suivantes doivent être remplies pour déposer une situation :
            </p>

            <div className={styles.checksList}>
              <div className={`${styles.checkItem} ${checks.pedigreeComplete ? styles.valid : styles.invalid}`}>
                <span className={styles.checkIcon}>
                  {checks.pedigreeComplete ? '✓' : '✗'}
                </span>
                <div className={styles.checkContent}>
                  <h4>Pedigree entreprise complet</h4>
                  <p>Toutes les informations de votre entreprise doivent être renseignées</p>
                </div>
              </div>

              <div className={`${styles.checkItem} ${checks.assurancesValides ? styles.valid : styles.invalid}`}>
                <span className={styles.checkIcon}>
                  {checks.assurancesValides ? '✓' : '✗'}
                </span>
                <div className={styles.checkContent}>
                  <h4>Assurances valides</h4>
                  <p>RC Pro et Décennale doivent être à jour et non expirées</p>
                </div>
              </div>

              <div className={`${styles.checkItem} ${checks.situationPrecedenteValidee ? styles.valid : styles.invalid}`}>
                <span className={styles.checkIcon}>
                  {checks.situationPrecedenteValidee ? '✓' : '✗'}
                </span>
                <div className={styles.checkContent}>
                  <h4>Situation N-1 validée</h4>
                  <p>La situation précédente doit être validée par la MOA</p>
                </div>
              </div>

              <div className={`${styles.checkItem} ${checks.dansLesDelais ? styles.valid : styles.invalid}`}>
                <span className={styles.checkIcon}>
                  {checks.dansLesDelais ? '✓' : '✗'}
                </span>
                <div className={styles.checkContent}>
                  <h4>Dans les délais</h4>
                  <p>Dépôt avant le 25 du mois</p>
                </div>
              </div>
            </div>

            {!checks.canDeposit && (
              <div className={styles.warningBox}>
                ⚠️ Vous ne pouvez pas déposer de situation tant que tous les points ne sont pas validés.
              </div>
            )}
          </div>
        )}

        {/* STEP 2: DOCUMENTS */}
        {currentStep === 2 && (
          <div className={styles.step}>
            <h2 className={styles.stepTitle}>Upload des documents</h2>
            <p className={styles.stepDescription}>
              Déposez vos 2 documents obligatoires au format PDF (max 15 MB chacun)
            </p>

            <div className={styles.uploadsGrid}>
              <FileUpload
                label="Situation de travaux (PDF) *"
                accept=".pdf"
                maxSize={15}
                file={files.situation_pdf}
                onChange={(file) => setFiles({ ...files, situation_pdf: file })}
              />

              <FileUpload
                label="Facture (PDF) *"
                accept=".pdf"
                maxSize={15}
                file={files.facture_pdf}
                onChange={(file) => setFiles({ ...files, facture_pdf: file })}
              />
            </div>
          </div>
        )}

        {/* STEP 3: AMOUNTS */}
        {currentStep === 3 && (
          <div className={styles.step}>
            <h2 className={styles.stepTitle}>Montants de la situation</h2>
            <p className={styles.stepDescription}>
              Renseignez les montants HT de votre situation
            </p>

            <div className={styles.amountsGrid}>
              <CurrencyInput
                label="Montant HT cumulé *"
                value={formData.montant_ht_cumul}
                onChange={(val) => setFormData({ ...formData, montant_ht_cumul: val })}
              />

              <CurrencyInput
                label="Montant HT du mois *"
                value={formData.montant_ht_mois}
                onChange={(val) => setFormData({ ...formData, montant_ht_mois: val })}
              />

              <div className={styles.formGroup}>
                <label className={styles.label}>Commentaire</label>
                <textarea
                  value={formData.commentaire}
                  onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                  className={styles.textarea}
                  rows={4}
                  placeholder="Observations éventuelles..."
                />
              </div>
            </div>

            <h3 className={styles.subsectionTitle}>Sous-traitants (optionnel)</h3>
            <p className={styles.subsectionDescription}>
              Si vous avez fait appel à des sous-traitants ce mois-ci, détaillez les montants
            </p>

            {formData.sousTraitants.map((st, index) => (
              <div key={index} className={styles.stRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nom du sous-traitant</label>
                  <input
                    type="text"
                    value={st.name}
                    onChange={(e) => updateSousTraitant(index, 'name', e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>SIRET</label>
                  <input
                    type="text"
                    value={st.siret}
                    onChange={(e) => updateSousTraitant(index, 'siret', e.target.value)}
                    className={styles.input}
                    maxLength={14}
                  />
                </div>

                <CurrencyInput
                  label="Montant HT"
                  value={st.montant_ht}
                  onChange={(val) => updateSousTraitant(index, 'montant_ht', val)}
                />

                <button
                  onClick={() => removeSousTraitant(index)}
                  className={styles.removeButton}
                >
                  Supprimer
                </button>
              </div>
            ))}

            <button onClick={addSousTraitant} className={styles.addButton}>
              + Ajouter un sous-traitant
            </button>

            <div className={styles.stTotal}>
              <strong>Total sous-traitance :</strong>
              <span className={styles.stTotalAmount}>
                {formData.sousTraitants.reduce((sum, st) => sum + (parseFloat(st.montant_ht) || 0), 0).toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </span>
            </div>
          </div>
        )}

        {/* STEP 4: SUMMARY */}
        {currentStep === 4 && (
          <div className={styles.step}>
            <h2 className={styles.stepTitle}>Récapitulatif</h2>
            <p className={styles.stepDescription}>
              Vérifiez les informations avant de confirmer le dépôt
            </p>

            <div className={styles.summary}>
              <div className={styles.summarySection}>
                <h4>Documents</h4>
                <ul>
                  <li>✓ Situation de travaux : {files.situation_pdf?.name}</li>
                  <li>✓ Facture : {files.facture_pdf?.name}</li>
                </ul>
              </div>

              <div className={styles.summarySection}>
                <h4>Montants</h4>
                <table className={styles.summaryTable}>
                  <tbody>
                    <tr>
                      <td>Montant HT cumulé</td>
                      <td className={styles.amount}>
                        {parseFloat(formData.montant_ht_cumul).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td>Montant HT du mois</td>
                      <td className={styles.amount}>
                        {parseFloat(formData.montant_ht_mois).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </td>
                    </tr>
                    {formData.sousTraitants.length > 0 && (
                      <tr>
                        <td>Dont sous-traitance</td>
                        <td className={styles.amount}>
                          {formData.sousTraitants.reduce((sum, st) => sum + (parseFloat(st.montant_ht) || 0), 0).toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {formData.commentaire && (
                <div className={styles.summarySection}>
                  <h4>Commentaire</h4>
                  <p>{formData.commentaire}</p>
                </div>
              )}
            </div>

            <div className={styles.confirmCheckbox}>
              <input type="checkbox" id="confirm" required />
              <label htmlFor="confirm">
                Je certifie l'exactitude des informations fournies et confirme le dépôt de cette situation
              </label>
            </div>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {currentStep > 1 && (
          <button onClick={handlePrevious} className={styles.secondaryButton}>
            ← Précédent
          </button>
        )}

        {currentStep < 4 ? (
          <button onClick={handleNext} className={styles.primaryButton}>
            Suivant →
          </button>
        ) : (
          <button onClick={handleConfirm} className={styles.confirmButton}>
            Confirmer le dépôt
          </button>
        )}
      </div>
    </div>
  );
}
