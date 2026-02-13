import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/withAuth';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { stId } = params;

    const [st] = await query(
      `SELECT st.*, e.name as entreprise_titulaire_name, l.name as lot_name
       FROM sous_traitants st
       JOIN entreprises e ON st.entreprise_titulaire_id = e.id
       JOIN lots l ON st.lot_id = l.id
       WHERE st.tenant_id = ? AND st.id = ?`,
      [user.tenant_id, stId]
    );

    if (!st) {
      return NextResponse.json({ error: 'Sous-traitant introuvable' }, { status: 404 });
    }

    return NextResponse.json({ soustraitant: st });
  } catch (error) {
    console.error('GET /api/operations/[id]/sous-traitants/[stId] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { stId } = params;
    const body = await request.json();

    await query(
      `UPDATE sous_traitants SET
        name = ?, siret = ?, contact_name = ?, contact_email = ?, contact_phone = ?,
        montant_ht = ?, perimetre = ?, paiement_mode = ?
       WHERE tenant_id = ? AND id = ?`,
      [
        body.name,
        body.siret,
        body.contact_name,
        body.contact_email,
        body.contact_phone,
        body.montant_ht,
        body.perimetre,
        body.paiement_mode,
        user.tenant_id,
        stId
      ]
    );

    return NextResponse.json({ message: 'Sous-traitant mis à jour' });
  } catch (error) {
    console.error('PUT /api/operations/[id]/sous-traitants/[stId] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { stId } = params;

    await query(
      'DELETE FROM sous_traitants WHERE tenant_id = ? AND id = ?',
      [user.tenant_id, stId]
    );

    return NextResponse.json({ message: 'Sous-traitant supprimé' });
  } catch (error) {
    console.error('DELETE /api/operations/[id]/sous-traitants/[stId] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
