'use client';

import { useState } from 'react';
import StatusBadge from './StatusBadge';
import styles from './DocumentCard.module.css';

export default function DocumentCard({
  type,
  title,
  document,
  onUpload,
  onDelete,
  required = false
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate PDF
    if (file.type !== 'application/pdf') {
      alert('Seuls les fichiers PDF sont acceptés');
      return;
    }

    // Validate size (15MB)
    if (file.size > 15 * 1024 * 1024) {
      alert('Le fichier ne doit pas dépasser 15 MB');
      return;
    }

    setUploading(true);
    try {
      await onUpload(file, type);
    } catch (error) {
      alert('Erreur lors de l\'upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {title}
          {required && <span className={styles.required}>*</span>}
        </h3>
        {document && <StatusBadge status={document.status} />}
      </div>

      {document ? (
        <div className={styles.documentInfo}>
          <div className={styles.fileName}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            {document.name}
          </div>
          <div className={styles.metadata}>
            <span className={styles.fileSize}>
              {(document.file_size / 1024).toFixed(0)} KB
            </span>
            <span className={styles.uploadDate}>
              Déposé le {new Date(document.created_at).toLocaleDateString('fr-FR')}
            </span>
            {document.expires_at && (
              <span className={styles.expiryDate}>
                Expire le {new Date(document.expires_at).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>

          {document.status === 'rejected' && document.rejection_reason && (
            <div className={styles.rejectionReason}>
              <strong>Motif de rejet :</strong> {document.rejection_reason}
            </div>
          )}

          <div className={styles.actions}>
            <label className={styles.uploadButton}>
              Remplacer
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
            {onDelete && (
              <button
                onClick={() => onDelete(document.id)}
                className={styles.deleteButton}
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.uploadZone}>
          <label className={styles.uploadLabel}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span className={styles.uploadText}>
              {uploading ? 'Upload en cours...' : 'Cliquez pour sélectionner un fichier PDF'}
            </span>
            <span className={styles.uploadHint}>
              Maximum 15 MB
            </span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
