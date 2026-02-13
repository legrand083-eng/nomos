'use client';

import CurrencyInput from './CurrencyInput';
import DateInput from './DateInput';
import DocumentCard from './DocumentCard';
import styles from './InsuranceCard.module.css';

export default function InsuranceCard({
  type, // 'rc' or 'decennale'
  title,
  data = {},
  document,
  onChange,
  onUploadDocument,
  onDeleteDocument
}) {
  const isRC = type === 'rc';
  const isDecennale = type === 'decennale';

  // Check if insurer is in blacklist
  const blacklist = ['LPS', 'Gibraltar', 'Liechtenstein', 'Malta'];
  const isBlacklisted = data.assureur && blacklist.some(term => 
    data.assureur.toLowerCase().includes(term.toLowerCase())
  );

  // Check expiry warning
  const getExpiryWarning = () => {
    if (!data.expire) return null;
    
    const expiryDate = new Date(data.expire);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { level: 'error', message: '⚠️ Assurance expirée' };
    } else if (daysUntilExpiry <= 7) {
      return { level: 'error', message: `⚠️ Expire dans ${daysUntilExpiry} jour${daysUntilExpiry > 1 ? 's' : ''}` };
    } else if (daysUntilExpiry <= 15) {
      return { level: 'error', message: `⚠️ Expire dans ${daysUntilExpiry} jours` };
    } else if (daysUntilExpiry <= 30) {
      return { level: 'warning', message: `⚠️ Expire dans ${daysUntilExpiry} jours` };
    }
    return null;
  };

  const expiryWarning = getExpiryWarning();

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>

      {isBlacklisted && (
        <div className={styles.blacklistWarning}>
          ⚠️ Assureur potentiellement non fiable (LPS)
        </div>
      )}

      {expiryWarning && (
        <div className={`${styles.expiryWarning} ${styles[expiryWarning.level]}`}>
          {expiryWarning.message}
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Assureur *</label>
          <input
            type="text"
            value={data.assureur || ''}
            onChange={(e) => onChange({ ...data, assureur: e.target.value })}
            className={styles.input}
            placeholder="Nom de la compagnie d'assurance"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Numéro de police *</label>
          <input
            type="text"
            value={data.numero || ''}
            onChange={(e) => onChange({ ...data, numero: e.target.value })}
            className={styles.input}
            placeholder="Ex: RC-2025-123456"
          />
        </div>

        {isRC && (
          <CurrencyInput
            label="Montant de garantie *"
            value={data.montant}
            onChange={(val) => onChange({ ...data, montant: val })}
          />
        )}

        {isDecennale && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Activités couvertes *</label>
            <textarea
              value={data.activites || ''}
              onChange={(e) => onChange({ ...data, activites: e.target.value })}
              className={styles.textarea}
              placeholder="Ex: Gros œuvre, maçonnerie, béton armé..."
              rows={3}
            />
          </div>
        )}

        <DateInput
          label="Date d'expiration *"
          value={data.expire}
          onChange={(val) => onChange({ ...data, expire: val })}
        />
      </div>

      <div className={styles.documentSection}>
        <DocumentCard
          type={type === 'rc' ? 'assurance_rc' : 'assurance_decennale'}
          title="Attestation d'assurance"
          document={document}
          onUpload={onUploadDocument}
          onDelete={onDeleteDocument}
          required
        />
      </div>
    </div>
  );
}
