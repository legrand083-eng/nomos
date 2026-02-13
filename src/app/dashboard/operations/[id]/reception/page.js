'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import ReceptionTimeline from '@/components/ui/ReceptionTimeline';
import styles from './reception.module.css';

export default function ReceptionPage({ params }) {
  const { id } = use(params);
  const [receptions, setReceptions] = useState([]);
  const [showAddReception, setShowAddReception] = useState(false);

  useEffect(() => {
    fetchReceptions();
  }, [id]);

  async function fetchReceptions() {
    const res = await fetch(`/api/operations/${id}/reception`);
    setReceptions(await res.json());
  }

  async function handleAddReception(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    await fetch(`/api/operations/${id}/reception`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: 1,
        ...Object.fromEntries(formData),
        has_reserves: formData.get('has_reserves') === 'on'
      })
    });
    setShowAddReception(false);
    fetchReceptions();
  }

  async function handleNotifierRetenues(receptionId) {
    await fetch(`/api/operations/${id}/reception/${receptionId}/retenues`, { method: 'POST' });
    fetchReceptions();
  }

  async function handleLibererRG(receptionId) {
    await fetch(`/api/operations/${id}/reception/${receptionId}/liberer-rg`, { method: 'POST' });
    fetchReceptions();
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Réceptions & Clôture</h1>

      <div className={styles.header}>
        <button onClick={() => setShowAddReception(true)} className={styles.btnAdd}>+ Enregistrer une réception</button>
      </div>

      {showAddReception && (
        <form onSubmit={handleAddReception} className={styles.form}>
          <select name="lot_id" required>
            <option value="">Sélectionner un lot</option>
            <option value="1">LOT 01</option>
            <option value="2">LOT 02</option>
          </select>
          <select name="entreprise_id" required>
            <option value="">Sélectionner une entreprise</option>
            <option value="1">Entreprise 1</option>
            <option value="2">Entreprise 2</option>
          </select>
          <select name="type" required>
            <option value="totale">Totale</option>
            <option value="partielle">Partielle</option>
          </select>
          <input type="date" name="date_reception" required />
          <label>
            <input type="checkbox" name="has_reserves" />
            Avec réserves
          </label>
          <button type="submit">Enregistrer</button>
          <button type="button" onClick={() => setShowAddReception(false)}>Annuler</button>
        </form>
      )}

      <div className={styles.receptionsList}>
        {receptions.map(r => (
          <div key={r.id} className={styles.receptionCard}>
            <div className={styles.cardHeader}>
              <span className={styles.lot}>LOT {r.lot_id}</span>
              <span className={`${styles.status} ${styles[r.status]}`}>{r.status}</span>
            </div>
            <ReceptionTimeline reception={r} />
            <div className={styles.actions}>
              {!r.retenues_notifiees && (
                <button onClick={() => handleNotifierRetenues(r.id)} className={styles.btnAction}>
                  Notifier retenues
                </button>
              )}
              {r.status === 'reserves_levees' && !r.rg_liberee && (
                <button onClick={() => handleLibererRG(r.id)} className={styles.btnAction}>
                  Libérer RG
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
