import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyToken } from '@/lib/withAuth';

export async function GET(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();
    const [remboursements] = await pool.query(
      `SELECT ar.*, s.numero as situation_numero, s.date_depot
       FROM avance_remboursements ar
       JOIN situations s ON ar.situation_id = s.id
       WHERE ar.avance_id IN (SELECT id FROM avances WHERE operation_id = ? AND lot_id = ? AND tenant_id = ?)
       ORDER BY s.date_depot ASC`,
      [params.id, params.lotId, token.tenant_id]
    );

    return NextResponse.json({ remboursements });
  } catch (error) {
    console.error('Error fetching remboursements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
