import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { checkPlafond } from '@/lib/penalite-engine';

export async function GET(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();
    const [penalites] = await pool.query(
      `SELECT p.*, l.montant_ht as montant_marche
       FROM penalites p
       JOIN lots l ON p.lot_id = l.id
       WHERE p.id = ? AND p.tenant_id = ?`,
      [params.id, token.tenant_id]
    );

    if (penalites.length === 0) {
      return NextResponse.json({ error: 'Pénalité not found' }, { status: 404 });
    }

    const penalite = penalites[0];
    const plafondInfo = checkPlafond(penalite.cumul_penalites, penalite.montant_marche, penalite.plafond_pourcent);

    return NextResponse.json({ plafond: plafondInfo });
  } catch (error) {
    console.error('Error checking plafond:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
