'use client';

import { useState } from 'react';
import styles from './GroupementConfig.module.css';

export default function GroupementConfig({ groupement, membres = [], onUpdate, readonly = false }) {
  const [type, setType] = useState(groupement?.type || 'solidaire');
  const [certificatMode, setCertificatMode] = useState(groupement?.certificat_mode || 'unique');

  const totalPart = membres.reduce((sum, m) => sum + parseFloat(m.part_pourcent || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <label className={styles.label}>Type de groupement</label>
        <select
          className={styles.select}
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={readonly}
        >
          <option value="solidaire">Solidaire</option>
          <option value="conjoint">Conjoint</option>
        </select>
        <div className={styles.hint}>
          {type === 'solidaire' ? 'Responsabilité solidaire — Un seul certificat' : 'Responsabilité conjointe — Certificats séparés'}
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Mode de certificat</label>
        <select
          className={styles.select}
          value={certificatMode}
          onChange={(e) => setCertificatMode(e.target.value)}
          disabled={readonly}
        >
          <option value="unique">Certificat unique (mandataire)</option>
          <option value="par_membre">Certificat par membre</option>
        </select>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Membres ({membres.length})</label>
        <div className={styles.membresList}>
          {membres.map((membre, index) => (
            <div key={index} className={styles.membre}>
              <div className={styles.membreInfo}>
                <span className={styles.membreName}>
                  {membre.name}
                  {membre.is_mandataire && <span className={styles.badge}>Mandataire</span>}
                </span>
                <span className={styles.membrePart}>
                  {membre.part_pourcent}% — {membre.montant_part.toLocaleString('fr-FR')} € HT
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className={`${styles.totalPart} ${totalPart !== 100 ? styles.error : ''}`}>
          Total : {totalPart.toFixed(2)}%
          {totalPart !== 100 && <span className={styles.errorIcon}>⚠</span>}
        </div>
      </div>

      {!readonly && (
        <button
          className={styles.saveButton}
          onClick={() => onUpdate({ type, certificat_mode: certificatMode })}
        >
          Enregistrer
        </button>
      )}
    </div>
  );
}
