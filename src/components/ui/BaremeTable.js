'use client';

import { useState } from 'react';
import styles from './BaremeTable.module.css';

export default function BaremeTable({ bareme, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(bareme || {
    name: '',
    type: 'retard',
    mode_calcul: 'forfaitaire',
    taux_jour: 0.00,
    montant_forfait: 0.00,
    seuil_jours: 0,
    plafond_pourcent: 10.00,
    exoneration_jours: 0
  });

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={styles.form}>
        <div className={styles.formGrid}>
          <label className={styles.label}>
            Nom du barème
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Type
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={styles.select}
            >
              <option value="retard">Retard</option>
              <option value="non_conformite">Non-conformité</option>
              <option value="securite">Sécurité</option>
            </select>
          </label>

          <label className={styles.label}>
            Mode de calcul
            <select
              value={formData.mode_calcul}
              onChange={(e) => setFormData({ ...formData, mode_calcul: e.target.value })}
              className={styles.select}
            >
              <option value="forfaitaire">Forfaitaire</option>
              <option value="proportionnel">Proportionnel</option>
            </select>
          </label>

          {formData.mode_calcul === 'proportionnel' && (
            <label className={styles.label}>
              Taux par jour (‰)
              <input
                type="number"
                step="0.01"
                value={formData.taux_jour}
                onChange={(e) => setFormData({ ...formData, taux_jour: parseFloat(e.target.value) })}
                className={styles.input}
              />
            </label>
          )}

          {formData.mode_calcul === 'forfaitaire' && (
            <label className={styles.label}>
              Montant forfaitaire (€)
              <input
                type="number"
                step="0.01"
                value={formData.montant_forfait}
                onChange={(e) => setFormData({ ...formData, montant_forfait: parseFloat(e.target.value) })}
                className={styles.input}
              />
            </label>
          )}

          <label className={styles.label}>
            Seuil déclenchement (jours)
            <input
              type="number"
              value={formData.seuil_jours}
              onChange={(e) => setFormData({ ...formData, seuil_jours: parseInt(e.target.value) })}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Plafond (%)
            <input
              type="number"
              step="0.01"
              value={formData.plafond_pourcent}
              onChange={(e) => setFormData({ ...formData, plafond_pourcent: parseFloat(e.target.value) })}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Exonération (jours)
            <input
              type="number"
              value={formData.exoneration_jours}
              onChange={(e) => setFormData({ ...formData, exoneration_jours: parseInt(e.target.value) })}
              className={styles.input}
            />
          </label>
        </div>

        <div className={styles.actions}>
          <button onClick={handleSave} className={styles.saveButton}>Enregistrer</button>
          <button onClick={() => setIsEditing(false)} className={styles.cancelButton}>Annuler</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.row}>
      <div className={styles.cell}>{bareme.name}</div>
      <div className={styles.cell}>
        <span className={`${styles.badge} ${styles[`badge${bareme.type}`]}`}>
          {bareme.type === 'retard' ? 'Retard' : bareme.type === 'non_conformite' ? 'Non-conformité' : 'Sécurité'}
        </span>
      </div>
      <div className={styles.cell}>
        {bareme.mode_calcul === 'forfaitaire' 
          ? `${bareme.montant_forfait} € forfait`
          : `${bareme.taux_jour}‰ / jour`
        }
      </div>
      <div className={styles.cell}>{bareme.seuil_jours} jours</div>
      <div className={styles.cell}>{bareme.plafond_pourcent}%</div>
      <div className={styles.cell}>{bareme.exoneration_jours} jours</div>
      <div className={styles.cellActions}>
        <button onClick={() => setIsEditing(true)} className={styles.editButton}>✏️</button>
        <button onClick={() => onDelete(bareme.id)} className={styles.deleteButton}>🗑️</button>
      </div>
    </div>
  );
}
