'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from './archives.module.css';

export default function ArchivesPage() {
  const params = useParams();
  const operationId = params.id;
  
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [verifying, setVerifying] = useState(null);
  
  useEffect(() => {
    fetchArchives();
  }, [operationId]);
  
  async function fetchArchives() {
    try {
      const res = await fetch(`/api/archives?operation_id=${operationId}`);
      const data = await res.json();
      setArchives(data.archives || []);
    } catch (error) {
      console.error('Error fetching archives:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function verifyIntegrity(archiveId) {
    setVerifying(archiveId);
    try {
      const res = await fetch(`/api/archives/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive_id: archiveId })
      });
      const data = await res.json();
      
      if (data.success) {
        alert(data.valid ? 'Intégrité vérifiée ✓' : 'ALERTE: Intégrité compromise !');
        fetchArchives();
      }
    } catch (error) {
      console.error('Error verifying integrity:', error);
      alert('Erreur lors de la vérification');
    } finally {
      setVerifying(null);
    }
  }
  
  function downloadArchive(archiveId, reference) {
    window.location.href = `/api/archives/download?id=${archiveId}`;
  }
  
  function getRetentionStatus(dateExpiration) {
    const now = new Date();
    const expiration = new Date(dateExpiration);
    const daysRemaining = Math.ceil((expiration - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) return { label: 'Expiré', class: 'expired' };
    if (daysRemaining < 30) return { label: `${daysRemaining}j restants`, class: 'expiring' };
    if (daysRemaining < 365) return { label: `${Math.ceil(daysRemaining / 30)} mois`, class: 'active' };
    return { label: `${Math.ceil(daysRemaining / 365)} ans`, class: 'active' };
  }
  
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  
  const filteredArchives = archives.filter(archive => {
    if (filter === 'all') return true;
    if (filter === 'certificat') return archive.type === 'certificat';
    if (filter === 'dgd') return archive.type === 'dgd';
    if (filter === 'pv_reception') return archive.type === 'pv_reception';
    if (filter === 'other') return !['certificat', 'dgd', 'pv_reception'].includes(archive.type);
    return true;
  });
  
  const typeLabels = {
    certificat: 'Certificat de paiement',
    dgd: 'Décompte général définitif',
    courrier: 'Courrier',
    pv_reception: 'PV de réception',
    situation: 'Situation de travaux',
    contrat: 'Contrat',
    avenant: 'Avenant',
    pedigree: 'Pedigree',
    autre: 'Autre'
  };
  
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Chargement des archives...</div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Archives Légales</h1>
        <p className={styles.subtitle}>
          Conservation à valeur probante — Rétention 10 ans (CCAG 2021)
        </p>
      </div>
      
      <div className={styles.filters}>
        <button
          className={filter === 'all' ? styles.filterActive : styles.filterBtn}
          onClick={() => setFilter('all')}
        >
          Tous ({archives.length})
        </button>
        <button
          className={filter === 'certificat' ? styles.filterActive : styles.filterBtn}
          onClick={() => setFilter('certificat')}
        >
          Certificats ({archives.filter(a => a.type === 'certificat').length})
        </button>
        <button
          className={filter === 'dgd' ? styles.filterActive : styles.filterBtn}
          onClick={() => setFilter('dgd')}
        >
          DGD ({archives.filter(a => a.type === 'dgd').length})
        </button>
        <button
          className={filter === 'pv_reception' ? styles.filterActive : styles.filterBtn}
          onClick={() => setFilter('pv_reception')}
        >
          PV Réception ({archives.filter(a => a.type === 'pv_reception').length})
        </button>
        <button
          className={filter === 'other' ? styles.filterActive : styles.filterBtn}
          onClick={() => setFilter('other')}
        >
          Autres
        </button>
      </div>
      
      {filteredArchives.length === 0 ? (
        <div className={styles.empty}>
          <p>Aucune archive pour ce filtre</p>
        </div>
      ) : (
        <div className={styles.archivesList}>
          {filteredArchives.map(archive => {
            const retention = getRetentionStatus(archive.date_expiration);
            
            return (
              <div key={archive.id} className={styles.archiveCard}>
                <div className={styles.archiveHeader}>
                  <div className={styles.archiveType}>
                    {typeLabels[archive.type] || archive.type}
                  </div>
                  <div className={`${styles.retentionBadge} ${styles[retention.class]}`}>
                    {retention.label}
                  </div>
                </div>
                
                <div className={styles.archiveBody}>
                  <h3>{archive.reference}</h3>
                  {archive.description && (
                    <p className={styles.description}>{archive.description}</p>
                  )}
                  
                  <div className={styles.archiveMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Date document:</span>
                      <span>{new Date(archive.date_document).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Archivé le:</span>
                      <span>{new Date(archive.date_archivage).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Taille:</span>
                      <span>{formatFileSize(archive.file_size)}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Archivé par:</span>
                      <span>{archive.archived_by_name || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className={styles.integrityStatus}>
                    {archive.verified_hash ? (
                      <span className={styles.verified}>
                        ✓ Intégrité vérifiée
                        {archive.last_verification && (
                          <span className={styles.verifiedDate}>
                            {' '}le {new Date(archive.last_verification).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className={styles.notVerified}>⚠ Non vérifié</span>
                    )}
                  </div>
                </div>
                
                <div className={styles.archiveActions}>
                  <button
                    className={styles.btnDownload}
                    onClick={() => downloadArchive(archive.id, archive.reference)}
                  >
                    📥 Télécharger
                  </button>
                  <button
                    className={styles.btnVerify}
                    onClick={() => verifyIntegrity(archive.id)}
                    disabled={verifying === archive.id}
                  >
                    {verifying === archive.id ? '⏳ Vérification...' : '🔒 Vérifier intégrité'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
