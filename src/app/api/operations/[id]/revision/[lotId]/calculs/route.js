import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: operationId, lotId } = params;
    const connection = await pool.getConnection();

    try {
      // Get all revision calculations for this lot
      const [calculs] = await connection.execute(
        `SELECT 
          rc.*,
          s.numero as situation_numero,
          s.date_depot as situation_date
         FROM revision_calculs rc
         JOIN situations s ON rc.situation_id = s.id
         WHERE rc.tenant_id = ? AND rc.operation_id = ? AND rc.lot_id = ?
         ORDER BY rc.mois ASC`,
        [auth.tenant_id, operationId, lotId]
      );

      return NextResponse.json({ calculs });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching revision calculations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
