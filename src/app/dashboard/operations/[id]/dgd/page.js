'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import DGDSummary from '@/components/ui/DGDSummary';
import styles from './dgd.module.css';

export default function DGDPage({ params }) {
  const { id } = use(params);
  const [dgds, setDgds] = useState([]);
  const [showGenerate, setShowGenerate] = useState(false);

  useEffect(() => {
    fetchDGDs();
  }, [id]);

  async function fetchDGDs() {
    const res = await fetch(`/api/operations/${id}/dgd`);
    setDgds(await res.json());
  }

  async function handleGenerateDGD(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    await fetch(`/api/operations/${id}/dgd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: 1,
        ...Object.fromEntries(formData)
      })
    });
    setShowGenerate(false);
    fetchDGDs();
  }

  async function handleSign(dgdId, role) {
    await fetch(`/api/operations/${id}/dgd/${dgdId}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    fetchDGDs();
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Décompte Général Définitif (DGD)</h1>

      <div className={styles.header}>
        <button onClick={() => setShowGenerate(true)} className={styles.btnAdd}>+ Générer un DGD</button>
      </div>

      {showGenerate && (
        <form onSubmit={handleGenerateDGD} className={styles.form}>
          <input type="number" name="lot_id" placeholder="Lot ID" required />
          <input type="number" name="entreprise_id" placeholder="Entreprise ID" required />
          <input type="number" name="reception_id" placeholder="Réception ID" required />
          <input type="number" step="0.01" name="total_travaux_ht" placeholder="Total travaux HT" required />
          <input type="number" step="0.01" name="total_revision" placeholder="Révision" defaultValue="0" />
          <input type="number" step="0.01" name="total_penalites" placeholder="Pénalités" defaultValue="0" />
          <input type="number" step="0.01" name="retenue_garantie" placeholder="RG (5%)" required />
          <input type="number" step="0.01" name="total_avances_remboursees" placeholder="Avances remboursées" defaultValue="0" />
          <input type="number" step="0.01" name="solde_prorata" placeholder="Solde prorata" defaultValue="0" />
          <input type="number" step="0.01" name="execution_aux_frais" placeholder="Exécution aux frais" defaultValue="0" />
          <button type="submit">Générer</button>
          <button type="button" onClick={() => setShowGenerate(false)}>Annuler</button>
        </form>
      )}

      <div className={styles.dgdsList}>
        {dgds.map(dgd => (
          <div key={dgd.id} className={styles.dgdCard}>
            <div className={styles.cardHeader}>
              <span className={styles.lot}>LOT {dgd.lot_id}</span>
              <span className={`${styles.status} ${styles[dgd.status]}`}>{dgd.status}</span>
            </div>
            <DGDSummary dgd={dgd} />
            <div className={styles.signatures}>
              <div className={styles.signature}>
                <span>Entreprise</span>
                {dgd.date_signature_entreprise ? (
                  <span className={styles.signed}>✓ Signé</span>
                ) : (
                  <button onClick={() => handleSign(dgd.id, 'entreprise')} className={styles.btnSign}>Signer</button>
                )}
              </div>
              <div className={styles.signature}>
                <span>MOE</span>
                {dgd.date_signature_moe ? (
                  <span className={styles.signed}>✓ Signé</span>
                ) : (
                  <button onClick={() => handleSign(dgd.id, 'moe')} className={styles.btnSign}>Signer</button>
                )}
              </div>
              <div className={styles.signature}>
                <span>MOA</span>
                {dgd.date_signature_moa ? (
                  <span className={styles.signed}>✓ Signé</span>
                ) : (
                  <button onClick={() => handleSign(dgd.id, 'moa')} className={styles.btnSign}>Signer</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
