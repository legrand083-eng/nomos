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
    const [avances] = await pool.query(
      `SELECT * FROM avances WHERE operation_id = ? AND lot_id = ? AND tenant_id = ?`,
      [params.id, params.lotId, token.tenant_id]
    );

    return NextResponse.json({ avance: avances[0] || null });
  } catch (error) {
    console.error('Error fetching avance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const pool = await getPool();

    await pool.query(
      `UPDATE avances SET taux = ?, base_calcul = ?, montant_avance = ?, seuil_debut_remb = ?, seuil_fin_remb = ?, updated_at = NOW()
       WHERE operation_id = ? AND lot_id = ? AND tenant_id = ?`,
      [body.taux, body.base_calcul, body.montant_avance, body.seuil_debut_remb, body.seuil_fin_remb, params.id, params.lotId, token.tenant_id]
    );

    return NextResponse.json({ message: 'Avance mise à jour' });
  } catch (error) {
    console.error('Error updating avance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
