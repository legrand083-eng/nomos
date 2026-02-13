'use client';

import { useState } from 'react';
import styles from './STDocChecklist.module.css';

const DOC_TYPES = [
  { key: 'dc4', label: 'DC4 (Déclaration de sous-traitance)', required: true },
  { key: 'kbis', label: 'Kbis (moins de 3 mois)', required: true },
  { key: 'urssaf', label: 'Attestation URSSAF', required: true },
  { key: 'attestation_fiscale', label: 'Attestation fiscale', required: true },
  { key: 'rc_pro', label: 'RC Professionnelle', required: true },
  { key: 'decennale', label: 'Assurance décennale', required: true },
  { key: 'contrat_st', label: 'Contrat de sous-traitance', required: true },
  { key: 'rib', label: 'RIB', required: true },
  { key: 'references', label: 'Références professionnelles', required: false },
  { key: 'qualifications', label: 'Qualifications', required: false }
];

export default function STDocChecklist({ documents = [], onUpload, onDelete, readonly = false }) {
  const [uploading, setUploading] = useState(null);

  const getDocStatus = (type) => {
    const doc = documents.find(d => d.type === type);
    if (!doc) return 'missing';
    if (doc.status === 'expired') return 'expired';
    if (doc.status === 'rejected') return 'rejected';
    if (doc.status === 'validated') return 'validated';
    return 'pending';
  };

  const getDoc = (type) => {
    return documents.find(d => d.type === type);
  };

  const handleFileChange = async (type, event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(type);
    try {
      await onUpload(type, file);
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (type) => {
    if (!confirm('Supprimer ce document ?')) return;
    await onDelete(type);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'validated': return '✓';
      case 'pending': return '⏳';
      case 'rejected': return '✗';
      case 'expired': return '⚠';
      default: return '○';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'validated': return 'var(--success)';
      case 'pending': return 'var(--warning)';
      case 'rejected': return 'var(--error)';
      case 'expired': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  };

  const completedCount = DOC_TYPES.filter(dt => getDocStatus(dt.key) === 'validated').length;
  const totalCount = DOC_TYPES.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Documents DC4 ({completedCount}/{totalCount})</h3>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className={styles.docList}>
        {DOC_TYPES.map(docType => {
          const status = getDocStatus(docType.key);
          const doc = getDoc(docType.key);

          return (
            <div key={docType.key} className={styles.docItem}>
              <div className={styles.docInfo}>
                <span
                  className={styles.docStatus}
                  style={{ color: getStatusColor(status) }}
                >
                  {getStatusIcon(status)}
                </span>
                <div className={styles.docDetails}>
                  <span className={styles.docLabel}>
                    {docType.label}
                    {docType.required && <span className={styles.required}>*</span>}
                  </span>
                  {doc && doc.expires_at && (
                    <span className={styles.docExpiry}>
                      Expire le {new Date(doc.expires_at).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.docActions}>
                {!readonly && (
                  <>
                    {!doc ? (
                      <label className={styles.uploadButton}>
                        {uploading === docType.key ? 'Upload...' : 'Upload'}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(docType.key, e)}
                          disabled={uploading === docType.key}
                          style={{ display: 'none' }}
                        />
                      </label>
                    ) : (
                      <>
                        <a
                          href={doc.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.viewButton}
                        >
                          Voir
                        </a>
                        <button
                          onClick={() => handleDelete(docType.key)}
                          className={styles.deleteButton}
                        >
                          ✗
                        </button>
                      </>
                    )}
                  </>
                )}
                {readonly && doc && (
                  <a
                    href={doc.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewButton}
                  >
                    Voir
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!readonly && completedCount < totalCount && (
        <div className={styles.warning}>
          ⚠ {totalCount - completedCount} document(s) manquant(s) pour soumettre au MOE
        </div>
      )}
    </div>
  );
}
