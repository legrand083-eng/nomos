'use client';

import { useState } from 'react';
import styles from './AvanceCard.module.css';
import { calculateAvanceForfaitaire, getRemboursementProgress } from '@/lib/avance-engine';

export default function AvanceCard({ avance, lot, onUpdate, onVerser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    taux: avance?.taux || 5.00,
    base_calcul: avance?.base_calcul || 'ttc',
    seuil_debut_remb: avance?.seuil_debut_remb || 65.00,
    seuil_fin_remb: avance?.seuil_fin_remb || 80.00
  });

  const montantMarche = lot?.montant_ht || 0;
  const montantAvance = avance?.montant_avance || calculateAvanceForfaitaire(montantMarche, formData.taux, formData.base_calcul);
  const progress = avance ? getRemboursementProgress(avance) : 0;

  const handleSave = () => {
    const montant = calculateAvanceForfaitaire(montantMarche, formData.taux, formData.base_calcul);
    onUpdate({ ...formData, montant_avance: montant });
    setIsEditing(false);
  };

  const getStatusBadge = () => {
    if (!avance || !avance.date_versement) {
      return <span className={`${styles.badge} ${styles.badgeGray}`}>Non demandée</span>;
    }
    
    switch (avance.status) {
      case 'versee':
        return <span className={`${styles.badge} ${styles.badgeGreen}`}>Versée</span>;
      case 'en_remboursement':
        return <span className={`${styles.badge} ${styles.badgeCyan}`}>En remboursement</span>;
      case 'soldee':
        return <span className={`${styles.badge} ${styles.badgeGold}`}>Soldée</span>;
      default:
        return <span className={`${styles.badge} ${styles.badgeGray}`}>{avance.status}</span>;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Avance Forfaitaire</h3>
        {getStatusBadge()}
      </div>

      {isEditing ? (
        <div className={styles.form}>
          <label className={styles.label}>
            Taux (%)
            <input
              type="number"
              step="0.01"
              value={formData.taux}
              onChange={(e) => setFormData({ ...formData, taux: parseFloat(e.target.value) })}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Base de calcul
            <select
              value={formData.base_calcul}
              onChange={(e) => setFormData({ ...formData, base_calcul: e.target.value })}
              className={styles.select}
            >
              <option value="ht">HT</option>
              <option value="ttc">TTC</option>
            </select>
          </label>

          <label className={styles.label}>
            Seuil début remboursement (%)
            <input
              type="number"
              step="0.01"
              value={formData.seuil_debut_remb}
              onChange={(e) => setFormData({ ...formData, seuil_debut_remb: parseFloat(e.target.value) })}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Seuil fin remboursement (%)
            <input
              type="number"
              step="0.01"
              value={formData.seuil_fin_remb}
              onChange={(e) => setFormData({ ...formData, seuil_fin_remb: parseFloat(e.target.value) })}
              className={styles.input}
            />
          </label>

          <div className={styles.actions}>
            <button onClick={handleSave} className={styles.saveButton}>Enregistrer</button>
            <button onClick={() => setIsEditing(false)} className={styles.cancelButton}>Annuler</button>
          </div>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.row}>
            <span className={styles.labelText}>Montant du marché :</span>
            <span className={styles.value}>{montantMarche.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
          </div>

          <div className={styles.row}>
            <span className={styles.labelText}>Taux :</span>
            <span className={styles.value}>{formData.taux} %</span>
          </div>

          <div className={styles.row}>
            <span className={styles.labelText}>Base :</span>
            <span className={styles.value}>{formData.base_calcul.toUpperCase()}</span>
          </div>

          <div className={styles.highlight}>
            <span className={styles.labelText}>Montant avance :</span>
            <span className={styles.montantAvance}>{montantAvance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
          </div>

          <div className={styles.row}>
            <span className={styles.labelText}>Seuils remboursement :</span>
            <span className={styles.value}>{formData.seuil_debut_remb}% → {formData.seuil_fin_remb}%</span>
          </div>

          {avance && avance.status === 'en_remboursement' && (
            <>
              <div className={styles.row}>
                <span className={styles.labelText}>Cumul remboursé :</span>
                <span className={styles.value}>{avance.cumul_rembourse.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              </div>

              <div className={styles.row}>
                <span className={styles.labelText}>Solde restant :</span>
                <span className={styles.value}>{avance.solde_restant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              </div>

              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                <span className={styles.progressText}>{progress}%</span>
              </div>
            </>
          )}

          <div className={styles.actions}>
            {!avance || !avance.date_versement ? (
              <>
                <button onClick={() => setIsEditing(true)} className={styles.editButton}>Configurer</button>
                <button onClick={onVerser} className={styles.verserButton}>Marquer comme versée</button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className={styles.editButton}>Modifier</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
