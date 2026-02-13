'use client';

import styles from './CertificatView.module.css';
import SignatureBlock from './SignatureBlock';

export default function CertificatView({ certificat, isProvisoire = true }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className={`${styles.certificat} ${isProvisoire ? styles.provisoire : ''}`}>
      {/* Zone 1: Identification */}
      <div className={styles.zoneIdentification}>
        <div className={styles.header}>
          <h1 className={styles.logo}>NOMOΣ</h1>
          <div className={styles.numero}>Certificat N° {certificat.numero}</div>
        </div>
        <div className={styles.infoGrid}>
          <div className={styles.infoBlock}>
            <h3>Maître d'Œuvre</h3>
            <p>{certificat.moe_name}</p>
            <p className={styles.siret}>SIRET : {certificat.moe_siret}</p>
          </div>
          <div className={styles.infoBlock}>
            <h3>Maître d'Ouvrage</h3>
            <p>{certificat.moa_name}</p>
          </div>
          <div className={styles.infoBlock}>
            <h3>Entreprise</h3>
            <p>{certificat.entreprise_name}</p>
            <p className={styles.siret}>SIRET : {certificat.entreprise_siret}</p>
          </div>
          <div className={styles.infoBlock}>
            <h3>Lot</h3>
            <p>Lot {certificat.lot_numero} — {certificat.lot_name}</p>
          </div>
        </div>
        <div className={styles.periode}>
          Période : {formatDate(certificat.mois_reference)}
        </div>
      </div>

      {/* Zone 2: Comptable */}
      <div className={styles.zoneComptable}>
        <h2>Décompte</h2>
        <table className={styles.tableComptable}>
          <tbody>
            <tr>
              <td>Montant initial du marché</td>
              <td className={styles.amount}>{formatCurrency(certificat.montant_marche_initial)}</td>
            </tr>
            <tr>
              <td>+ Avenants</td>
              <td className={styles.amount}>{formatCurrency(certificat.montant_avenants)}</td>
            </tr>
            <tr className={styles.totalRow}>
              <td>= Montant total du marché</td>
              <td className={styles.amount}>{formatCurrency(certificat.montant_marche_total)}</td>
            </tr>
            <tr>
              <td>Cumul précédent (N-1)</td>
              <td className={styles.amount}>{formatCurrency(certificat.montant_cumul_precedent)}</td>
            </tr>
            <tr>
              <td>Cumul actuel (N)</td>
              <td className={styles.amount}>{formatCurrency(certificat.montant_cumul_actuel)}</td>
            </tr>
            <tr className={styles.highlightRow}>
              <td>= Montant du mois HT</td>
              <td className={styles.amount}>{formatCurrency(certificat.montant_mois_ht)}</td>
            </tr>
            <tr>
              <td>TVA ({certificat.tva_rate}%)</td>
              <td className={styles.amount}>
                {certificat.tva_autoliquidation ? 'Auto-liquidation' : formatCurrency(certificat.montant_tva)}
              </td>
            </tr>
            <tr className={styles.totalRow}>
              <td>= Montant TTC</td>
              <td className={styles.amount}>{formatCurrency(certificat.montant_ttc)}</td>
            </tr>
            <tr className={styles.deductionRow}>
              <td>- Retenue de garantie ({certificat.retenue_garantie_rate}%)</td>
              <td className={styles.amount}>-{formatCurrency(certificat.rg_after_tva)}</td>
            </tr>
            {certificat.penalites_montant > 0 && (
              <tr className={styles.deductionRow}>
                <td>- Pénalités</td>
                <td className={styles.amount}>-{formatCurrency(certificat.penalites_montant)}</td>
              </tr>
            )}
            {certificat.prorata_montant > 0 && (
              <tr className={styles.deductionRow}>
                <td>- Prorata</td>
                <td className={styles.amount}>-{formatCurrency(certificat.prorata_montant)}</td>
              </tr>
            )}
            {certificat.avance_remboursement > 0 && (
              <tr className={styles.deductionRow}>
                <td>- Remboursement avance</td>
                <td className={styles.amount}>-{formatCurrency(certificat.avance_remboursement)}</td>
              </tr>
            )}
            {certificat.revision_applicable && certificat.revision_montant > 0 && (
              <tr className={styles.revisionRow}>
                <td>+ Révision de prix (coef. {certificat.revision_coefficient})</td>
                <td className={styles.amount}>+{formatCurrency(certificat.revision_montant)}</td>
              </tr>
            )}
            <tr className={styles.netRow}>
              <td><strong>= NET À PAYER</strong></td>
              <td className={styles.amount}><strong>{formatCurrency(certificat.net_a_payer)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Zone 3: Sous-traitants */}
      <div className={styles.zoneSousTraitants}>
        <h2>Sous-traitants</h2>
        {certificat.has_sous_traitants && certificat.sous_traitants && certificat.sous_traitants.length > 0 ? (
          <table className={styles.tableST}>
            <thead>
              <tr>
                <th>Nom</th>
                <th>SIRET</th>
                <th>Montant HT mois</th>
                <th>Cumul</th>
                <th>Paiement direct</th>
              </tr>
            </thead>
            <tbody>
              {certificat.sous_traitants.map((st, index) => (
                <tr key={index}>
                  <td>{st.sous_traitant_name}</td>
                  <td>{st.sous_traitant_siret}</td>
                  <td className={styles.amount}>{formatCurrency(st.montant_ht)}</td>
                  <td className={styles.amount}>{formatCurrency(st.montant_cumul)}</td>
                  <td>{st.paiement_direct ? 'Oui' : 'Non'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.neant}>Néant</p>
        )}
      </div>

      {/* Zone 4: Signatures */}
      <div className={styles.zoneSignatures}>
        <h2>Signatures</h2>
        <div className={styles.signaturesGrid}>
          <SignatureBlock 
            role="Entreprise"
            label="Accepté"
            date={certificat.date_signature_entreprise}
            code={certificat.code_signature_entreprise}
          />
          <SignatureBlock 
            role="MOE"
            label="Certifié"
            date={certificat.date_signature_moe}
            code={certificat.code_signature_moe}
          />
          <SignatureBlock 
            role="MOA"
            label="Validé pour paiement"
            date={certificat.date_validation_moa}
            code={certificat.code_validation_moa}
          />
        </div>
      </div>
    </div>
  );
}
