'use client';

import styles from './FinancialTable.module.css';

export default function FinancialTable({ data = [], onLineClick = null }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Poste DPGF</th>
            <th>Description</th>
            <th className={styles.numericColumn}>Montant marché</th>
            <th className={styles.numericColumn}>Cumul N-1</th>
            <th className={styles.numericColumn}>Réclamé N</th>
            <th className={styles.numericColumn}>Validé MOE</th>
            <th className={styles.numericColumn}>Écart</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr 
              key={index} 
              onClick={() => onLineClick && onLineClick(row)}
              className={onLineClick ? styles.clickable : ''}
            >
              <td className={styles.dpgfCode}>{row.code}</td>
              <td>{row.description}</td>
              <td className={styles.numericColumn}>{formatCurrency(row.montantMarche)}</td>
              <td className={styles.numericColumn}>{formatCurrency(row.cumulPrecedent)}</td>
              <td className={styles.numericColumn}>{formatCurrency(row.reclame)}</td>
              <td className={styles.numericColumn}>{formatCurrency(row.valide)}</td>
              <td className={`${styles.numericColumn} ${row.ecart !== 0 ? styles.ecart : ''}`}>
                {formatCurrency(row.ecart)}
              </td>
              <td>
                <span className={`${styles.statusBadge} ${styles[`status${row.status}`]}`}>
                  {row.status === 'valide' ? '✓' : row.status === 'refuse' ? '✗' : '⏳'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
