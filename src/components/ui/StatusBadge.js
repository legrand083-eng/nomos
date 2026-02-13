import styles from './StatusBadge.module.css';

export default function StatusBadge({ status, label }) {
  const statusMap = {
    brouillon: { color: 'grey', text: label || 'Brouillon' },
    deposee: { color: 'violet', text: label || 'Déposée' },
    controle_opc: { color: 'violet', text: label || 'Contrôle OPC' },
    controle_moe: { color: 'violet', text: label || 'Contrôle MOE' },
    certificat_genere: { color: 'blue', text: label || 'Certificat généré' },
    validee_moa: { color: 'green', text: label || 'Validée MOA' },
    payee: { color: 'green', text: label || 'Payée' },
    contestee: { color: 'orange', text: label || 'Contestée' },
    rejetee: { color: 'red', text: label || 'Rejetée' },
    pending: { color: 'orange', text: label || 'En attente' },
    validated: { color: 'green', text: label || 'Validé' },
    rejected: { color: 'red', text: label || 'Rejeté' },
    expired: { color: 'red', text: label || 'Expiré' },
    ouverte: { color: 'orange', text: label || 'Ouverte' },
    en_cours: { color: 'violet', text: label || 'En cours' },
    resolue: { color: 'green', text: label || 'Résolue' },
  };

  const config = statusMap[status] || { color: 'grey', text: status };

  return (
    <span className={`${styles.badge} ${styles[config.color]}`}>
      {config.text}
    </span>
  );
}
