'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import DepenseCard from '@/components/ui/DepenseCard';
import RepartitionTable from '@/components/ui/RepartitionTable';
import styles from './prorata.module.css';

export default function ProrataPage({ params }) {
  const { id } = use(params);
  const [compte, setCompte] = useState(null);
  const [depenses, setDepenses] = useState([]);
  const [repartitions, setRepartitions] = useState([]);
  const [showAddDepense, setShowAddDepense] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    const [compteRes, depensesRes, repartitionsRes] = await Promise.all([
      fetch(`/api/operations/${id}/prorata`),
      fetch(`/api/operations/${id}/prorata/depenses`),
      fetch(`/api/operations/${id}/prorata/repartitions`)
    ]);
    setCompte(await compteRes.json());
    setDepenses(await depensesRes.json());
    setRepartitions(await repartitionsRes.json());
  }

  async function handleAddDepense(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    await fetch(`/api/operations/${id}/prorata/depenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData))
    });
    setShowAddDepense(false);
    fetchData();
  }

  async function handleDeleteDepense(depenseId) {
    await fetch(`/api/operations/${id}/prorata/depenses/${depenseId}`, { method: 'DELETE' });
    fetchData();
  }

  async function handleContestDepense(depenseId) {
    await fetch(`/api/operations/${id}/prorata/depenses/${depenseId}/contest`, { method: 'POST' });
    fetchData();
  }

  async function handleUpdateRepartition(repId, field, value) {
    const updated = repartitions.map(r => r.id === repId ? { ...r, [field]: value } : r);
    setRepartitions(updated);
  }

  async function handleSaveRepartitions() {
    await fetch(`/api/operations/${id}/prorata/repartitions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repartitions })
    });
    fetchData();
  }

  if (!compte) return <div>Chargement...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Compte Prorata</h1>

      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Recettes</span>
          <span className={styles.kpiValue}>{compte.total_recettes.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Dépenses</span>
          <span className={styles.kpiValue}>{compte.total_depenses.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Solde</span>
          <span className={`${styles.kpiValue} ${compte.solde >= 0 ? styles.positive : styles.negative}`}>
            {compte.solde.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Dépenses partagées</h2>
          <button onClick={() => setShowAddDepense(true)} className={styles.btnAdd}>+ Ajouter</button>
        </div>
        {showAddDepense && (
          <form onSubmit={handleAddDepense} className={styles.form}>
            <input type="date" name="date_depense" required />
            <input type="text" name="designation" placeholder="Désignation" required />
            <select name="categorie" required>
              <option value="gardiennage">Gardiennage</option>
              <option value="nettoyage">Nettoyage</option>
              <option value="reparation_identifie">Réparation identifiée</option>
              <option value="reparation_non_identifie">Réparation non identifiée</option>
              <option value="eau_electricite">Eau & Électricité</option>
              <option value="vol">Vol</option>
              <option value="divers">Divers</option>
            </select>
            <input type="number" step="0.01" name="montant_ht" placeholder="Montant HT" required />
            <button type="submit">Enregistrer</button>
            <button type="button" onClick={() => setShowAddDepense(false)}>Annuler</button>
          </form>
        )}
        <div className={styles.depensesList}>
          {depenses.map(d => (
            <DepenseCard
              key={d.id}
              depense={d}
              onDelete={handleDeleteDepense}
              onContest={handleContestDepense}
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Répartition des charges</h2>
          <button onClick={handleSaveRepartitions} className={styles.btnSave}>Enregistrer</button>
        </div>
        <RepartitionTable repartitions={repartitions} onUpdate={handleUpdateRepartition} />
      </section>
    </div>
  );
}
