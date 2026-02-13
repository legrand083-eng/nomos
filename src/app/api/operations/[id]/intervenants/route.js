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
      `INSERT INTO intervenants (
        tenant_id, operation_id, type, is_mandataire, name, siret,
        address, city, postal_code,
        contact_direction_name, contact_direction_email, contact_direction_phone,
        contact_technique_name, contact_technique_email, contact_technique_phone,
        contact_compta_name, contact_compta_email, contact_compta_phone,
        signe_certificats, perimetre_lots, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.tenant_id,
        id,
        data.type,
        data.is_mandataire || false,
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
        data.signe_certificats || false,
        data.perimetre_lots,
        data.sort_order || 0
      ]
    );

    return NextResponse.json({ id: result.insertId, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating intervenant:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
