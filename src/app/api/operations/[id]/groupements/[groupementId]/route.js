import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/withAuth';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { groupementId } = params;

    const [groupement] = await query(
      'SELECT * FROM groupements WHERE tenant_id = ? AND id = ?',
      [user.tenant_id, groupementId]
    );

    if (!groupement) {
      return NextResponse.json({ error: 'Groupement introuvable' }, { status: 404 });
    }

    const membres = await query(
      `SELECT gm.*, e.name
       FROM groupement_membres gm
       JOIN entreprises e ON gm.entreprise_id = e.id
       WHERE gm.tenant_id = ? AND gm.groupement_id = ?
       ORDER BY gm.is_mandataire DESC, gm.part_pourcent DESC`,
      [user.tenant_id, groupementId]
    );

    return NextResponse.json({ groupement, membres });
  } catch (error) {
    console.error('GET /api/operations/[id]/groupements/[groupementId] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { groupementId } = params;
    const body = await request.json();

    await query(
      'UPDATE groupements SET type = ?, mandataire_solidaire = ?, certificat_mode = ? WHERE tenant_id = ? AND id = ?',
      [body.type, body.mandataire_solidaire, body.certificat_mode, user.tenant_id, groupementId]
    );

    return NextResponse.json({ message: 'Groupement mis à jour' });
  } catch (error) {
    console.error('PUT /api/operations/[id]/groupements/[groupementId] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { groupementId } = params;

    await query('DELETE FROM groupements WHERE tenant_id = ? AND id = ?', [user.tenant_id, groupementId]);

    return NextResponse.json({ message: 'Groupement supprimé' });
  } catch (error) {
    console.error('DELETE /api/operations/[id]/groupements/[groupementId] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
