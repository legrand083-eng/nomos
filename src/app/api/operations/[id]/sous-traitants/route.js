import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/withAuth';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: operationId } = params;

    const soustraitants = await query(
      `SELECT st.*, e.name as entreprise_titulaire_name, l.name as lot_name
       FROM sous_traitants st
       JOIN entreprises e ON st.entreprise_titulaire_id = e.id
       JOIN lots l ON st.lot_id = l.id
       WHERE st.tenant_id = ? AND st.operation_id = ?
       ORDER BY st.created_at DESC`,
      [user.tenant_id, operationId]
    );

    return NextResponse.json({ soustraitants });
  } catch (error) {
    console.error('GET /api/operations/[id]/sous-traitants error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: operationId } = params;
    const body = await request.json();

    const result = await query(
      `INSERT INTO sous_traitants (
        tenant_id, operation_id, lot_id, entreprise_titulaire_id,
        name, siret, contact_name, contact_email, contact_phone,
        montant_ht, perimetre, paiement_mode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.tenant_id,
        operationId,
        body.lot_id,
        body.entreprise_titulaire_id,
        body.name,
        body.siret,
        body.contact_name,
        body.contact_email,
        body.contact_phone,
        body.montant_ht,
        body.perimetre,
        body.paiement_mode || 'direct'
      ]
    );

    return NextResponse.json({ id: result.insertId, message: 'Sous-traitant créé' });
  } catch (error) {
    console.error('POST /api/operations/[id]/sous-traitants error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
