'use client';

import { useState } from 'react';
import styles from './CourrierModal.module.css';

export default function CourrierModal({ type, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    destinataire_email: '',
    objet: '',
    contenu: '',
    mode_envoi: 'email'
  });

  const getTemplate = () => {
    switch (type) {
      case 'opc_validation':
        return {
          objet: 'Validation avancement — Situation de travaux',
          contenu: 'Monsieur,\n\nNous vous informons que la situation de travaux a été contrôlée et validée.\n\nLe dossier est transmis pour contrôle financier.\n\nCordialement,'
        };
      case 'opc_demande_complement':
        return {
          objet: 'Demande de complément — Situation de travaux',
          contenu: 'Monsieur,\n\nSuite au contrôle de votre situation de travaux, nous vous demandons de bien vouloir fournir les compléments suivants :\n\n[À compléter]\n\nCordialement,'
        };
      case 'moe_certificat_pret':
        return {
          objet: 'Certificat de paiement prêt pour signature',
          contenu: 'Monsieur,\n\nVotre certificat de paiement est prêt pour signature.\n\nMerci de le consulter et de le signer via votre espace NOMOΣ.\n\nCordialement,'
        };
      default:
        return { objet: '', contenu: '' };
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h3 className={styles.title}>Envoyer un courrier</h3>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Email destinataire</label>
            <input 
              type="email"
              value={formData.destinataire_email}
              onChange={(e) => setFormData({...formData, destinataire_email: e.target.value})}
              placeholder="entreprise@example.com"
              required
            />
          </div>

          <div className={styles.field}>
            <label>Objet</label>
            <input 
              type="text"
              value={formData.objet || getTemplate().objet}
              onChange={(e) => setFormData({...formData, objet: e.target.value})}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Contenu</label>
            <textarea 
              value={formData.contenu || getTemplate().contenu}
              onChange={(e) => setFormData({...formData, contenu: e.target.value})}
              rows={12}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Mode d'envoi</label>
            <select 
              value={formData.mode_envoi}
              onChange={(e) => setFormData({...formData, mode_envoi: e.target.value})}
            >
              <option value="email">Email</option>
              <option value="ar24">AR24</option>
              <option value="rar">RAR</option>
              <option value="recommande">Recommandé</option>
            </select>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onCancel} className={styles.btnCancel}>
              Annuler
            </button>
            <button type="submit" className={styles.btnSubmit}>
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
