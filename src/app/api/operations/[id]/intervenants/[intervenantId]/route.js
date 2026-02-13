import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import pool from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id, intervenantId } = params;
    const data = await request.json();

    // Verify intervenant belongs to user's tenant and operation
    const [intervenants] = await pool.query(
      `SELECT i.id FROM intervenants i
       JOIN operations o ON i.operation_id = o.id
       WHERE i.id = ? AND i.operation_id = ? AND i.tenant_id = ?`,
      [intervenantId, id, user.tenant_id]
    );

    if (intervenants.length === 0) {
      return NextResponse.json({ error: 'Intervenant non trouvé' }, { status: 404 });
    }

    await pool.query(
      `UPDATE intervenants SET
        type = ?,
        is_mandataire = ?,
        name = ?,
        siret = ?,
        address = ?,
        city = ?,
        postal_code = ?,
        contact_direction_name = ?,
        contact_direction_email = ?,
        contact_direction_phone = ?,
        contact_technique_name = ?,
        contact_technique_email = ?,
        contact_technique_phone = ?,
        contact_compta_name = ?,
        contact_compta_email = ?,
        contact_compta_phone = ?,
        signe_certificats = ?,
        perimetre_lots = ?,
        sort_order = ?,
        updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [
        data.type,
        data.is_mandataire,
        data.name,
        data.siret,
        data.address,
        data.city,
        data.postal_code,
        data.contact_direction_name,
        data.contact_direction_email,
        data.contact_direction_phone,
        data.contact_technique_name,
        data.contact_technique_email,
        data.contact_technique_phone,
        data.contact_compta_name,
        data.contact_compta_email,
        data.contact_compta_phone,
        data.signe_certificats,
        data.perimetre_lots,
        data.sort_order,
        intervenantId,
        user.tenant_id
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating intervenant:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id, intervenantId } = params;

    // Verify intervenant belongs to user's tenant and operation
    const [intervenants] = await pool.query(
      `SELECT i.id FROM intervenants i
       JOIN operations o ON i.operation_id = o.id
       WHERE i.id = ? AND i.operation_id = ? AND i.tenant_id = ?`,
      [intervenantId, id, user.tenant_id]
    );

    if (intervenants.length === 0) {
      return NextResponse.json({ error: 'Intervenant non trouvé' }, { status: 404 });
    }

    await pool.query(
      `DELETE FROM intervenants WHERE id = ? AND tenant_id = ?`,
      [intervenantId, user.tenant_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting intervenant:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
