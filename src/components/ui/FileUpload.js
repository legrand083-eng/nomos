'use client';

import { useState, useRef } from 'react';
import styles from './FileUpload.module.css';

export default function FileUpload({ 
  onUpload, 
  label, 
  accept = '.pdf',
  maxSize = 20 * 1024 * 1024, // 20MB
  currentFile = null
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file) => {
    setError(null);

    // Validate file type
    if (!file.type.includes('pdf')) {
      setError('Seuls les fichiers PDF sont acceptés');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`Le fichier est trop volumineux (max ${maxSize / 1024 / 1024}MB)`);
      return;
    }

    // Simulate upload (replace with actual upload logic)
    setUploading(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          onUpload(file);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${uploading ? styles.uploading : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className={styles.fileInput}
        />

        {!uploading && !currentFile && (
          <>
            <div className={styles.icon}>📄</div>
            <p className={styles.text}>
              Glissez-déposez votre fichier PDF ici
              <br />
              <span className={styles.subtext}>ou cliquez pour sélectionner</span>
            </p>
            <p className={styles.hint}>PDF uniquement, max {maxSize / 1024 / 1024}MB</p>
          </>
        )}

        {uploading && (
          <>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
            </div>
            <p className={styles.text}>Upload en cours... {progress}%</p>
          </>
        )}

        {currentFile && !uploading && (
          <>
            <div className={styles.icon}>✓</div>
            <p className={styles.text}>
              Fichier uploadé : <strong>{currentFile}</strong>
            </p>
            <p className={styles.hint}>Cliquez pour remplacer</p>
          </>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
