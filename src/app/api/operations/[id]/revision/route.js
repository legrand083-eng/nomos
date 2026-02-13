import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: operationId } = params;
    const connection = await pool.getConnection();

    try {
      // Get all revision formulas for this operation
      const [formules] = await connection.execute(
        `SELECT 
          rf.*,
          l.numero as lot_numero,
          l.nom as lot_nom
         FROM revision_formules rf
         JOIN lots l ON rf.lot_id = l.id
         WHERE rf.tenant_id = ? AND rf.operation_id = ?
         ORDER BY l.numero`,
        [auth.tenant_id, operationId]
      );

      // Parse JSON parameters
      const formulesWithParsedParams = formules.map(f => ({
        ...f,
        parametres: f.parametres ? JSON.parse(f.parametres) : null
      }));

      return NextResponse.json({ formules: formulesWithParsedParams });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching revision formulas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
