'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './certificat.module.css';
import CertificatView from '@/components/ui/CertificatView';
import Timeline from '@/components/ui/Timeline';

export default function CertificatPage() {
  const params = useParams();
  const router = useRouter();
  const [certificat, setCertificat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignModal, setShowSignModal] = useState(false);
  const [userRole, setUserRole] = useState('moe'); // Mock

  useEffect(() => {
    fetchCertificat();
  }, [params.id]);

  const fetchCertificat = async () => {
    try {
      // Mock data - in production, fetch from API
      const mockCertificat = {
        id: params.id,
        numero: '000001',
        moe_name: 'POLARIS CONSEIL',
        moe_siret: '12345678901234',
        moa_name: 'Ville de Paris',
        entreprise_name: 'ENTREPRISE TOTEM',
        entreprise_siret: '98765432109876',
        lot_numero: '01',
        lot_name: 'Gros œuvre',
        mois_reference: '2026-01-01',
        montant_marche_initial: 500000,
        montant_avenants: 50000,
        montant_marche_total: 550000,
        montant_cumul_precedent: 250000,
        montant_cumul_actuel: 350000,
        montant_mois_ht: 100000,
        tva_rate: 20,
        tva_autoliquidation: false,
        montant_tva: 20000,
        montant_ttc: 120000,
        retenue_garantie_rate: 5,
        rg_after_tva: 6000,
        penalites_montant: 500,
        prorata_montant: 0,
        avance_remboursement: 0,
        revision_applicable: true,
        revision_coefficient: 1.02,
        revision_montant: 2000,
        net_a_payer: 115500,
        has_sous_traitants: true,
        sous_traitants: [
          {
            sous_traitant_name: 'ST Électricité',
            sous_traitant_siret: '11111111111111',
            montant_ht: 15000,
            montant_cumul: 45000,
            paiement_direct: true
          }
        ],
        date_signature_entreprise: null,
        code_signature_entreprise: null,
        date_signature_moe: null,
        code_signature_moe: null,
        date_validation_moa: null,
        code_validation_moa: null,
        status: 'brouillon'
      };

      setCertificat(mockCertificat);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching certificat:', error);
      setLoading(false);
    }
  };

  const handleSign = async () => {
    const codeMaitre = prompt(`Entrez votre code MAÎTRE (${userRole.toUpperCase()})`);
    if (!codeMaitre) return;

    try {
      const res = await fetch(`/api/certificats/${params.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code_maitre: codeMaitre, role: userRole })
      });

      if (res.ok) {
        alert('Certificat signé avec succès');
        fetchCertificat();
      } else {
        const json = await res.json();
        alert(`Erreur : ${json.error}`);
      }
    } catch (error) {
      console.error('Error signing certificat:', error);
    }
  };

  const handleTransmitMOA = async () => {
    try {
      const res = await fetch(`/api/certificats/${params.id}/transmit-moa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        alert('Certificat transmis au MOA');
        fetchCertificat();
      }
    } catch (error) {
      console.error('Error transmitting to MOA:', error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await fetch(`/api/certificats/${params.id}/pdf`);
      const json = await res.json();
      alert('Génération PDF (à implémenter avec puppeteer)');
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  if (!certificat) {
    return <div className={styles.error}>Certificat introuvable</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Certificat de Paiement N° {certificat.numero}</h1>
          <p className={styles.subtitle}>
            {certificat.is_provisoire ? 'PROVISOIRE' : 'DÉFINITIF'} — {certificat.status}
          </p>
        </div>
        <div className={styles.actions}>
          <button onClick={handleSign} className={`${styles.btn} ${styles.btnPrimary}`}>
            ✍️ Signer
          </button>
          <button onClick={handleTransmitMOA} className={`${styles.btn} ${styles.btnSuccess}`}>
            📤 Transmettre au MOA
          </button>
          <button onClick={handleDownloadPDF} className={`${styles.btn} ${styles.btnSecondary}`}>
            📄 Télécharger PDF
          </button>
        </div>
      </div>

      <Timeline currentStep="certificat" />

      <div className={styles.certificatContainer}>
        <CertificatView certificat={certificat} isProvisoire={certificat.is_provisoire} />
      </div>
    </div>
  );
}
