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
      `UPDATE penalite_baremes SET name = ?, type = ?, mode_calcul = ?, taux_jour = ?, montant_forfait = ?, seuil_jours = ?, plafond_pourcent = ?, exoneration_jours = ?, updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [body.name, body.type, body.mode_calcul, body.taux_jour, body.montant_forfait, body.seuil_jours, body.plafond_pourcent, body.exoneration_jours, params.baremeId, token.tenant_id]
    );

    return NextResponse.json({ message: 'Barème mis à jour' });
  } catch (error) {
    console.error('Error updating bareme:', error);
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
      `DELETE FROM penalite_baremes WHERE id = ? AND tenant_id = ?`,
      [params.baremeId, token.tenant_id]
    );

    return NextResponse.json({ message: 'Barème supprimé' });
  } catch (error) {
    console.error('Error deleting bareme:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
