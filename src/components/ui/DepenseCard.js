'use client';
import { useState } from 'react';
import styles from './DepenseCard.module.css';

export default function DepenseCard({ depense, onUpdate, onDelete, onContest }) {
  const [isEditing, setIsEditing] = useState(false);

  const categories = {
    gardiennage: 'Gardiennage',
    nettoyage: 'Nettoyage',
    reparation_identifie: 'Réparation identifiée',
    reparation_non_identifie: 'Réparation non identifiée',
    eau_electricite: 'Eau & Électricité',
    vol: 'Vol',
    divers: 'Divers'
  };

  return (
    <div className={`${styles.card} ${depense.is_contested ? styles.contested : ''}`}>
      <div className={styles.header}>
        <span className={styles.date}>{new Date(depense.date_depense).toLocaleDateString('fr-FR')}</span>
        <span className={`${styles.category} ${styles[depense.categorie]}`}>
          {categories[depense.categorie]}
        </span>
      </div>
      <div className={styles.designation}>{depense.designation}</div>
      <div className={styles.amount}>{depense.montant_ht.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
      {depense.entreprise_fautive_id && (
        <div className={styles.fautive}>Entreprise fautive : LOT {depense.entreprise_fautive_id}</div>
      )}
      {depense.is_contested && (
        <div className={styles.arbitrage}>
          <span className={styles.status}>{depense.arbitrage_status === 'en_cours' ? '⏳ En cours' : '✓ Résolue'}</span>
        </div>
      )}
      <div className={styles.actions}>
        {!depense.is_contested && (
          <button onClick={() => onContest(depense.id)} className={styles.btnContest}>Contester</button>
        )}
        <button onClick={() => onDelete(depense.id)} className={styles.btnDelete}>Supprimer</button>
      </div>
    </div>
  );
}
