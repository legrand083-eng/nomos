import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const pool = await getPool();

    await pool.query(
      `UPDATE avances SET status = 'versee', date_versement = ?, updated_at = NOW()
       WHERE operation_id = ? AND lot_id = ? AND tenant_id = ?`,
      [body.date_versement || new Date(), params.id, params.lotId, token.tenant_id]
    );

    return NextResponse.json({ message: 'Avance marquée comme versée' });
  } catch (error) {
    console.error('Error marking avance as versee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
