import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/withAuth';
import pool from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    // Verify operation belongs to user's tenant
    const [operations] = await pool.query(
      `SELECT id FROM operations WHERE id = ? AND tenant_id = ?`,
      [id, user.tenant_id]
    );

    if (operations.length === 0) {
      return NextResponse.json({ error: 'Opération non trouvée' }, { status: 404 });
    }

    const [result] = await pool.query(
      `INSERT INTO jalons (
        tenant_id, operation_id, lot_id, name, date_prevue, date_reelle,
        type, penalite_applicable, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.tenant_id,
        id,
        data.lot_id || null,
        data.name,
        data.date_prevue,
        data.date_reelle || null,
        data.type,
        data.penalite_applicable !== undefined ? data.penalite_applicable : true,
        data.status || 'a_venir'
      ]
    );

    return NextResponse.json({ id: result.insertId, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating jalon:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
