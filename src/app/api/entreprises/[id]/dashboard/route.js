import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import pool from '@/lib/db';

export const GET = withAuth(async (req, { params, user }) => {
  try {
    const entrepriseId = params.id;

    // Get entreprise with lot info
    const [entreprises] = await pool.query(
      `SELECT e.*, l.id as lot_id, l.montant_ht as montant_marche_ht, 
              o.id as operation_id, o.name as operation_name
       FROM entreprises e
       LEFT JOIN lots l ON e.id = l.entreprise_id
       LEFT JOIN operations o ON l.operation_id = o.id
       WHERE e.id = ? AND e.tenant_id = ?`,
      [entrepriseId, user.tenant_id]
    );

    if (entreprises.length === 0) {
      return NextResponse.json({ error: 'Entreprise not found' }, { status: 404 });
    }

    const entreprise = entreprises[0];

    // Get situations
    const [situations] = await pool.query(
      `SELECT * FROM situations 
       WHERE entreprise_id = ? AND tenant_id = ?
       ORDER BY numero DESC`,
      [entrepriseId, user.tenant_id]
    );

    // Calculate KPIs
    const montantMarche = entreprise.montant_marche_ht || 0;
    const cumulPaye = situations
      .filter(s => s.status === 'payee')
      .reduce((sum, s) => sum + parseFloat(s.montant_valide_ht || 0), 0);
    
    const enAttentePaiement = situations
      .filter(s => ['validee_moa', 'certificat_genere'].includes(s.status))
      .reduce((sum, s) => sum + parseFloat(s.montant_valide_ht || s.montant_ht_cumul || 0), 0);
    
    const resteAFacturer = montantMarche - (cumulPaye + enAttentePaiement);

    // Get urgent actions
    const actions = [];

    // Check for certificates to sign
    const certificatsASignerCount = situations.filter(s => s.status === 'certificat_genere').length;
    if (certificatsASignerCount > 0) {
      actions.push({
        color: 'red',
        title: `${certificatsASignerCount} certificat${certificatsASignerCount > 1 ? 's' : ''} à signer`,
        description: 'Signature requise pour validation',
        link: `/dashboard/entreprise/situations`
      });
    }

    // Check for situation to deposit
    const lastSituation = situations[0];
    const canDeposit = !lastSituation || ['payee', 'validee_moa'].includes(lastSituation.status);
    if (canDeposit) {
      actions.push({
        color: 'orange',
        title: 'Déposer une nouvelle situation',
        description: `Avant le 25 du mois`,
        link: `/dashboard/entreprise/depot-situation`
      });
    }

    // Check for expired documents
    const [expiredDocs] = await pool.query(
      `SELECT COUNT(*) as count FROM documents 
       WHERE entreprise_id = ? AND tenant_id = ? AND status = 'expired'`,
      [entrepriseId, user.tenant_id]
    );

    if (expiredDocs[0].count > 0) {
      actions.push({
        color: 'orange',
        title: 'Documents expirés',
        description: `${expiredDocs[0].count} document${expiredDocs[0].count > 1 ? 's' : ''} à renouveler`,
        link: `/dashboard/entreprise/${entrepriseId}/pedigree`
      });
    }

    return NextResponse.json({
      entreprise,
      situations,
      kpis: {
        montantMarche,
        cumulPaye,
        enAttentePaiement,
        resteAFacturer
      },
      actions
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
