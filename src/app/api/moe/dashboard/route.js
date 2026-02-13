import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(request) {
  return withAuth(request, async (user) => {
    const { searchParams } = new URL(request.url);
    const operationId = searchParams.get('operation_id');

    if (!operationId) {
      return NextResponse.json({ error: 'operation_id required' }, { status: 400 });
    }

    const conn = await db();

    // Situations en attente de contrôle MOE
    const [situations] = await conn.query(
      `SELECT 
        s.*,
        l.numero as lot_numero,
        l.nom as lot_nom,
        e.nom as entreprise_nom,
        e.id as entreprise_id
      FROM situations s
      JOIN lots l ON s.lot_id = l.id
      JOIN entreprises e ON l.entreprise_id = e.id
      WHERE l.operation_id = ? 
        AND s.tenant_id = ?
        AND s.status = 'controle_moe'
      ORDER BY s.created_at ASC`,
      [operationId, user.tenant_id]
    );

    // KPIs financiers
    const [kpis] = await conn.query(
      `SELECT 
        SUM(montant_marche_initial) as montant_total_marches,
        SUM(montant_cumul_actuel) as montant_total_paye
      FROM lots l
      WHERE l.operation_id = ? AND l.tenant_id = ?`,
      [operationId, user.tenant_id]
    );

    await conn.end();

    return NextResponse.json({
      situations,
      kpis: kpis[0] || { montant_total_marches: 0, montant_total_paye: 0 }
    });
  });
}
