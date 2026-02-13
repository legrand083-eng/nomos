'use client';

import { useState } from 'react';
import styles from './CourrierThread.module.css';

export default function CourrierThread({ courriers, onReply }) {
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = (courrierId) => {
    setReplyTo(courrierId);
    setReplyContent('');
  };

  const handleSend = async () => {
    if (!replyContent.trim()) return;
    
    await onReply(replyTo, replyContent);
    setReplyTo(null);
    setReplyContent('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.thread}>
      {courriers.map((courrier) => (
        <div key={courrier.id} className={styles.message}>
          <div className={styles.header}>
            <div className={styles.sender}>
              <span className={styles.name}>{courrier.destinataire_name}</span>
              <span className={styles.badge} data-mode={courrier.mode_envoi}>
                {courrier.mode_envoi}
              </span>
            </div>
            <span className={styles.timestamp}>{formatDate(courrier.date_envoi)}</span>
          </div>
          
          <div className={styles.subject}>{courrier.objet}</div>
          
          <div className={styles.content}>
            {courrier.contenu.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          {courrier.envoi_status === 'envoye' && (
            <button 
              className={styles.replyBtn}
              onClick={() => handleReply(courrier.id)}
            >
              Répondre
            </button>
          )}

          {replyTo === courrier.id && (
            <div className={styles.replyBox}>
              <textarea
                className={styles.textarea}
                placeholder="Votre réponse..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={6}
              />
              <div className={styles.actions}>
                <button className={styles.cancelBtn} onClick={() => setReplyTo(null)}>
                  Annuler
                </button>
                <button className={styles.sendBtn} onClick={handleSend}>
                  Envoyer
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
