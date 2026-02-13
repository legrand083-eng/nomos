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
      `UPDATE penalites SET exoneration = TRUE, exoneration_motif = ?, exoneration_date = NOW(), updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [body.motif, params.id, token.tenant_id]
    );

    return NextResponse.json({ message: 'Pénalité exonérée' });
  } catch (error) {
    console.error('Error exonerating penalite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
