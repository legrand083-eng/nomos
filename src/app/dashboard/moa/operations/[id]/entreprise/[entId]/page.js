'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './entreprise.module.css';
import CourrierThread from '@/components/ui/CourrierThread';

export default function MOAEntrepriseDetail() {
  const router = useRouter();
  const params = useParams();
  const { id: operationId, entId: entrepriseId } = params;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('situations');

  useEffect(() => {
    fetchData();
  }, [operationId, entrepriseId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/moa/operations/${operationId}/entreprise/${entrepriseId}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error fetching entreprise:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  if (!data) {
    return <div className={styles.error}>Entreprise non trouvée</div>;
  }

  const { entreprise, situations, documents, penalites, courriers, contestations, emails } = data;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push(`/dashboard/moa/operations/${operationId}`)}>
          ← Retour à l'opération
        </button>
        <h1 className={styles.title}>{entreprise.name}</h1>
        <p className={styles.subtitle}>
          Lot {entreprise.lot_numero} - {entreprise.lot_name} • SIRET : {entreprise.siret}
        </p>
      </div>

      {/* Entreprise Info */}
      <div className={styles.infoCard}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Montant marché</span>
            <span className={styles.infoValue}>{formatCurrency(entreprise.montant_marche)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>RC Pro</span>
            <span className={styles.infoValue}>{formatDate(entreprise.assurance_rc_date_fin)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Décennale</span>
            <span className={styles.infoValue}>{formatDate(entreprise.assurance_decennale_date_fin)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Caution</span>
            <span className={styles.infoValue}>{formatDate(entreprise.caution_date_fin)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'situations' ? styles.active : ''}`}
          onClick={() => setActiveTab('situations')}
        >
          Situations ({situations.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'documents' ? styles.active : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents ({documents.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'penalites' ? styles.active : ''}`}
          onClick={() => setActiveTab('penalites')}
        >
          Pénalités ({penalites.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'courriers' ? styles.active : ''}`}
          onClick={() => setActiveTab('courriers')}
        >
          Courriers ({courriers.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'contestations' ? styles.active : ''}`}
          onClick={() => setActiveTab('contestations')}
        >
          Contestations ({contestations.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'emails' ? styles.active : ''}`}
          onClick={() => setActiveTab('emails')}
        >
          Emails ({emails.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'situations' && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>N°</th>
                <th>Statut</th>
                <th>Date dépôt</th>
                <th>N° Certificat</th>
                <th>Montant</th>
                <th>Statut certificat</th>
              </tr>
            </thead>
            <tbody>
              {situations.map((sit) => (
                <tr key={sit.id}>
                  <td className={styles.sitNum}>{sit.numero}</td>
                  <td>
                    <span className={styles.badge} data-status={sit.status}>
                      {sit.status}
                    </span>
                  </td>
                  <td>{formatDate(sit.date_depot)}</td>
                  <td className={styles.certNum}>{sit.numero_certificat || '—'}</td>
                  <td className={styles.amount}>{formatCurrency(sit.montant_net_a_payer)}</td>
                  <td>
                    {sit.certificat_status && (
                      <span className={styles.badge} data-status={sit.certificat_status}>
                        {sit.certificat_status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'documents' && (
          <div className={styles.documentList}>
            {documents.map((doc) => (
              <div key={doc.id} className={styles.documentItem}>
                <div className={styles.documentIcon}>📄</div>
                <div className={styles.documentInfo}>
                  <div className={styles.documentName}>{doc.nom_fichier}</div>
                  <div className={styles.documentMeta}>
                    {doc.type_document} • {formatDate(doc.uploaded_at)}
                  </div>
                </div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className={styles.documentBtn}>
                  Télécharger
                </a>
              </div>
            ))}
            {documents.length === 0 && (
              <div className={styles.empty}>Aucun document</div>
            )}
          </div>
        )}

        {activeTab === 'penalites' && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Montant</th>
                <th>Motif</th>
                <th>Statut</th>
                <th>Proposée par</th>
                <th>Décidée par</th>
              </tr>
            </thead>
            <tbody>
              {penalites.map((pen) => (
                <tr key={pen.id}>
                  <td>{pen.type}</td>
                  <td className={styles.amount}>{formatCurrency(pen.montant)}</td>
                  <td>{pen.motif}</td>
                  <td>
                    <span className={styles.badge} data-status={pen.status}>
                      {pen.status}
                    </span>
                  </td>
                  <td>{pen.proposed_by_name}</td>
                  <td>{pen.decided_by_name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'courriers' && (
          <CourrierThread courriers={courriers} />
        )}

        {activeTab === 'contestations' && (
          <div className={styles.contestationList}>
            {contestations.map((cont) => (
              <div key={cont.id} className={styles.contestationItem}>
                <div className={styles.contestationHeader}>
                  <span className={styles.contestationObjet}>{cont.objet}</span>
                  <span className={styles.badge} data-status={cont.status}>
                    {cont.status}
                  </span>
                </div>
                <div className={styles.contestationBody}>
                  <p><strong>Montant contesté :</strong> {formatCurrency(cont.montant_conteste)}</p>
                  <p><strong>Justification :</strong> {cont.justification}</p>
                  {cont.decision_moa && (
                    <div className={styles.decision}>
                      <strong>Décision MOA :</strong> {cont.decision_moa}
                    </div>
                  )}
                </div>
                <div className={styles.contestationFooter}>
                  Déposée le {formatDate(cont.created_at)}
                </div>
              </div>
            ))}
            {contestations.length === 0 && (
              <div className={styles.empty}>Aucune contestation</div>
            )}
          </div>
        )}

        {activeTab === 'emails' && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Template</th>
                <th>Catégorie</th>
                <th>Destinataire</th>
                <th>Objet</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => (
                <tr key={email.id}>
                  <td>{formatDate(email.created_at)}</td>
                  <td className={styles.templateCode}>{email.template_code}</td>
                  <td>{email.category}</td>
                  <td>{email.destinataire_email}</td>
                  <td>{email.objet}</td>
                  <td>
                    <span className={styles.badge} data-status={email.send_status}>
                      {email.send_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
