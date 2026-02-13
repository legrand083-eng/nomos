'use client';

import { useState } from 'react';
import styles from './ArbitragePanel.module.css';

export default function ArbitragePanel({ item, type = 'penalite', onDecide }) {
  const [decision, setDecision] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!decision) return;
    
    setLoading(true);
    await onDecide(item.id, decision, comment);
    setLoading(false);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.type}>
          {type === 'penalite' ? '⚠️ Pénalité' : '📋 Contestation'}
        </span>
        <span className={styles.status} data-status={item.status}>
          {item.status}
        </span>
      </div>

      {type === 'penalite' && (
        <div className={styles.details}>
          <div className={styles.row}>
            <span className={styles.label}>Entreprise :</span>
            <span className={styles.value}>{item.entreprise_name}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Lot :</span>
            <span className={styles.value}>{item.lot_name}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Type :</span>
            <span className={styles.value}>{item.type}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Montant :</span>
            <span className={styles.amount}>{item.montant.toLocaleString('fr-FR')} €</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Référence CCAP :</span>
            <span className={styles.value}>{item.reference_ccap}</span>
          </div>
        </div>
      )}

      <div className={styles.motif}>
        <div className={styles.label}>Motif :</div>
        <div className={styles.text}>{item.motif}</div>
      </div>

      <div className={styles.proposedBy}>
        Proposé par : <strong>{item.proposed_by_name}</strong> le{' '}
        {new Date(item.proposed_at).toLocaleDateString('fr-FR')}
      </div>

      {item.status === 'proposee' && (
        <div className={styles.decision}>
          <div className={styles.buttons}>
            <button
              className={styles.validateBtn}
              onClick={() => setDecision('validee_moa')}
              data-active={decision === 'validee_moa'}
            >
              ✓ Valider
            </button>
            <button
              className={styles.refuseBtn}
              onClick={() => setDecision('refusee_moa')}
              data-active={decision === 'refusee_moa'}
            >
              ✗ Refuser
            </button>
          </div>

          {decision && (
            <div className={styles.commentBox}>
              <label className={styles.label}>
                Commentaire {decision === 'refusee_moa' && '(obligatoire)'}:
              </label>
              <textarea
                className={styles.textarea}
                placeholder="Votre commentaire..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={loading || (decision === 'refusee_moa' && !comment.trim())}
              >
                {loading ? 'Envoi...' : 'Confirmer la décision'}
              </button>
            </div>
          )}
        </div>
      )}

      {item.status !== 'proposee' && item.decision_comment && (
        <div className={styles.decisionMade}>
          <div className={styles.label}>Décision MOA :</div>
          <div className={styles.text}>{item.decision_comment}</div>
          <div className={styles.decidedBy}>
            Décidé par : <strong>{item.decided_by_name}</strong> le{' '}
            {new Date(item.decided_at).toLocaleDateString('fr-FR')}
          </div>
        </div>
      )}
    </div>
  );
}
