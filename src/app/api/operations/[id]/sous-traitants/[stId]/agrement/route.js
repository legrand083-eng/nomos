import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { stId } = params;
    const body = await request.json();

    let newStatus = body.action === 'soumettre_moe' ? 'soumis_moe' :
                    body.action === 'valider_moe' ? 'valide_moe' :
                    body.action === 'soumettre_moa' ? 'soumis_moa' :
                    body.action === 'agreer' ? 'agree' :
                    body.action === 'refuser' ? 'refuse' : null;

    if (!newStatus) {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
    }

    const dateField = newStatus === 'soumis_moe' ? 'date_soumission' :
                      newStatus === 'valide_moe' ? 'date_agrement_moe' :
                      newStatus === 'agree' ? 'date_agrement_moa' : null;

    let updateQuery = 'UPDATE sous_traitants SET agrement_status = ?';
    let updateParams = [newStatus];

    if (dateField) {
      updateQuery += `, ${dateField} = CURDATE()`;
    }

    if (newStatus === 'refuse') {
      updateQuery += ', agrement_refus_motif = ?';
      updateParams.push(body.motif || '');
    }

    updateQuery += ' WHERE tenant_id = ? AND id = ?';
    updateParams.push(user.tenant_id, stId);

    await query(updateQuery, updateParams);

    return NextResponse.json({ message: 'Statut agrément mis à jour' });
  } catch (error) {
    console.error('POST /api/operations/[id]/sous-traitants/[stId]/agrement error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
