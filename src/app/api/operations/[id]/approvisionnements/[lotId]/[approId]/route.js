import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyToken } from '@/lib/withAuth';

export async function PUT(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const pool = await getPool();

    await pool.query(
      `UPDATE approvisionnements SET designation = ?, montant_ht = ?, date_livraison_prevue = ?, taux_avance = ?, updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [body.designation, body.montant_ht, body.date_livraison_prevue, body.taux_avance, params.approId, token.tenant_id]
    );

    return NextResponse.json({ message: 'Approvisionnement mis à jour' });
  } catch (error) {
    console.error('Error updating approvisionnement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();
    await pool.query(
      `DELETE FROM approvisionnements WHERE id = ? AND tenant_id = ?`,
      [params.approId, token.tenant_id]
    );

    return NextResponse.json({ message: 'Approvisionnement supprimé' });
  } catch (error) {
    console.error('Error deleting approvisionnement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
