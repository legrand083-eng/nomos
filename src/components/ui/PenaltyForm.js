'use client';

import { useState } from 'react';
import styles from './PenaltyForm.module.css';
import CurrencyInput from './CurrencyInput';

export default function PenaltyForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    type: 'retard_depot',
    motif: '',
    reference_ccap: '',
    montant: 0,
    mode: 'provisoire',
    mode_envoi: 'email'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h3 className={styles.title}>Proposer une pénalité</h3>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Type de pénalité</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              required
            >
              <option value="retard_depot">Retard de dépôt</option>
              <option value="retard_execution">Retard d'exécution</option>
              <option value="absence_reunion">Absence réunion</option>
              <option value="non_conformite">Non-conformité</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Référence CCAP (obligatoire)</label>
            <input 
              type="text"
              value={formData.reference_ccap}
              onChange={(e) => setFormData({...formData, reference_ccap: e.target.value})}
              placeholder="Article 20.1 CCAG 2021"
              required
            />
          </div>

          <div className={styles.field}>
            <label>Motif détaillé</label>
            <textarea 
              value={formData.motif}
              onChange={(e) => setFormData({...formData, motif: e.target.value})}
              placeholder="Décrire précisément le motif de la pénalité..."
              rows={4}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Montant</label>
            <CurrencyInput 
              value={formData.montant}
              onChange={(value) => setFormData({...formData, montant: value})}
            />
          </div>

          <div className={styles.field}>
            <label>Mode</label>
            <select 
              value={formData.mode}
              onChange={(e) => setFormData({...formData, mode: e.target.value})}
            >
              <option value="provisoire">Provisoire</option>
              <option value="definitive">Définitive</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Mode d'envoi</label>
            <select 
              value={formData.mode_envoi}
              onChange={(e) => setFormData({...formData, mode_envoi: e.target.value})}
            >
              <option value="email">Email</option>
              <option value="ar24">AR24</option>
              <option value="rar">RAR</option>
              <option value="recommande">Recommandé</option>
            </select>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onCancel} className={styles.btnCancel}>
              Annuler
            </button>
            <button type="submit" className={styles.btnSubmit}>
              Proposer au MOA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
