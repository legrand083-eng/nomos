import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/withAuth';
import { query } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { groupementId } = params;
    const body = await request.json();

    const result = await query(
      'INSERT INTO groupement_membres (tenant_id, groupement_id, entreprise_id, is_mandataire, part_pourcent, montant_part) VALUES (?, ?, ?, ?, ?, ?)',
      [user.tenant_id, groupementId, body.entreprise_id, body.is_mandataire, body.part_pourcent, body.montant_part]
    );

    return NextResponse.json({ id: result.insertId, message: 'Membre ajouté' });
  } catch (error) {
    console.error('POST /api/operations/[id]/groupements/[groupementId]/membres error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
