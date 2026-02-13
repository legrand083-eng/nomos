'use client';
import styles from './RepartitionTable.module.css';

export default function RepartitionTable({ repartitions, onUpdate }) {
  const total = repartitions.reduce((sum, r) => sum + parseFloat(r.part_pourcent), 0);
  const isValid = Math.abs(total - 100) < 0.01;

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Entreprise / Lot</th>
            <th>Part (%)</th>
            <th>Montant dû</th>
            <th>Montant versé</th>
            <th>Solde</th>
          </tr>
        </thead>
        <tbody>
          {repartitions.map((r) => (
            <tr key={r.id}>
              <td>LOT {r.lot_id}</td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  value={r.part_pourcent}
                  onChange={(e) => onUpdate(r.id, 'part_pourcent', parseFloat(e.target.value))}
                  className={styles.input}
                />
              </td>
              <td className={styles.amount}>{r.montant_du.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
              <td className={styles.amount}>{r.montant_verse.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
              <td className={`${styles.amount} ${r.solde > 0 ? styles.positive : styles.negative}`}>
                {r.solde.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>TOTAL</td>
            <td className={`${styles.total} ${isValid ? styles.valid : styles.invalid}`}>
              {total.toFixed(2)} %
            </td>
            <td colSpan="3"></td>
          </tr>
        </tfoot>
      </table>
      {!isValid && (
        <div className={styles.warning}>⚠️ La somme des parts doit être égale à 100%</div>
      )}
    </div>
  );
}
