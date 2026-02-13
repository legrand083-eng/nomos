import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/withAuth';
import pool from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id, jalonId } = params;
    const data = await request.json();

    // Verify jalon belongs to user's tenant and operation
    const [jalons] = await pool.query(
      `SELECT j.id FROM jalons j
       JOIN operations o ON j.operation_id = o.id
       WHERE j.id = ? AND j.operation_id = ? AND j.tenant_id = ?`,
      [jalonId, id, user.tenant_id]
    );

    if (jalons.length === 0) {
      return NextResponse.json({ error: 'Jalon non trouvé' }, { status: 404 });
    }

    await pool.query(
      `UPDATE jalons SET
        lot_id = ?,
        name = ?,
        date_prevue = ?,
        date_reelle = ?,
        type = ?,
        penalite_applicable = ?,
        status = ?,
        updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [
        data.lot_id || null,
        data.name,
        data.date_prevue,
        data.date_reelle || null,
        data.type,
        data.penalite_applicable,
        data.status,
        jalonId,
        user.tenant_id
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating jalon:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id, jalonId } = params;

    // Verify jalon belongs to user's tenant and operation
    const [jalons] = await pool.query(
      `SELECT j.id FROM jalons j
       JOIN operations o ON j.operation_id = o.id
       WHERE j.id = ? AND j.operation_id = ? AND j.tenant_id = ?`,
      [jalonId, id, user.tenant_id]
    );

    if (jalons.length === 0) {
      return NextResponse.json({ error: 'Jalon non trouvé' }, { status: 404 });
    }

    await pool.query(
      `DELETE FROM jalons WHERE id = ? AND tenant_id = ?`,
      [jalonId, user.tenant_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting jalon:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
