import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import pool from '@/lib/db';

export const GET = withAuth(async (req, { params, user }) => {
  try {
    const operationId = params.id;
    const { searchParams } = new URL(req.url);
    const entrepriseId = searchParams.get('entreprise_id');
    const lotId = searchParams.get('lot_id');

    const checks = {
      pedigreeComplete: false,
      assurancesValides: false,
      situationPrecedenteValidee: false,
      dansLesDelais: false,
      canDeposit: false
    };

    // Check 1: Pedigree complete
    const [entreprises] = await pool.query(
      `SELECT pedigree_completion FROM entreprises 
       WHERE id = ? AND tenant_id = ?`,
      [entrepriseId, user.tenant_id]
    );

    if (entreprises.length > 0 && entreprises[0].pedigree_completion === 100) {
      checks.pedigreeComplete = true;
    }

    // Check 2: Assurances valides
    const [assurances] = await pool.query(
      `SELECT assurance_rc_expire, assurance_decennale_expire 
       FROM entreprises 
       WHERE id = ? AND tenant_id = ?`,
      [entrepriseId, user.tenant_id]
    );

    if (assurances.length > 0) {
      const today = new Date();
      const rcExpire = new Date(assurances[0].assurance_rc_expire);
      const decennaleExpire = new Date(assurances[0].assurance_decennale_expire);
      
      if (rcExpire > today && decennaleExpire > today) {
        checks.assurancesValides = true;
      }
    }

    // Check 3: Situation N-1 validée
    const [lastSituation] = await pool.query(
      `SELECT status FROM situations 
       WHERE operation_id = ? AND lot_id = ? AND tenant_id = ?
       ORDER BY numero DESC
       LIMIT 1`,
      [operationId, lotId, user.tenant_id]
    );

    if (lastSituation.length === 0 || ['validee_moa', 'payee'].includes(lastSituation[0].status)) {
      checks.situationPrecedenteValidee = true;
    }

    // Check 4: Dans les délais
    const [operations] = await pool.query(
      `SELECT date_limite_situation FROM operations 
       WHERE id = ? AND tenant_id = ?`,
      [operationId, user.tenant_id]
    );

    if (operations.length > 0) {
      const today = new Date();
      const dateLimite = operations[0].date_limite_situation || 25;
      const currentDay = today.getDate();
      
      if (currentDay <= dateLimite) {
        checks.dansLesDelais = true;
      }
    }

    // Overall check
    checks.canDeposit = checks.pedigreeComplete && 
                        checks.assurancesValides && 
                        checks.situationPrecedenteValidee && 
                        checks.dansLesDelais;

    return NextResponse.json({ checks });
  } catch (error) {
    console.error('Error checking deposit conditions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
