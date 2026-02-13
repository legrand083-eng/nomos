import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/withAuth';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { stId } = params;
    const paiements = await query(
      'SELECT * FROM st_paiements WHERE tenant_id = ? AND sous_traitant_id = ? ORDER BY created_at DESC',
      [user.tenant_id, stId]
    );

    return NextResponse.json({ paiements });
  } catch (error) {
    console.error('GET /api/operations/[id]/sous-traitants/[stId]/paiements error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { stId } = params;
    const body = await request.json();

    const result = await query(
      'INSERT INTO st_paiements (tenant_id, sous_traitant_id, certificat_id, montant_ht, montant_cumul, paiement_direct) VALUES (?, ?, ?, ?, ?, ?)',
      [user.tenant_id, stId, body.certificat_id, body.montant_ht, body.montant_cumul, body.paiement_direct]
    );

    await query(
      'UPDATE sous_traitants SET cumul_paye = ? WHERE tenant_id = ? AND id = ?',
      [body.montant_cumul, user.tenant_id, stId]
    );

    return NextResponse.json({ id: result.insertId, message: 'Paiement enregistré' });
  } catch (error) {
    console.error('POST /api/operations/[id]/sous-traitants/[stId]/paiements error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
