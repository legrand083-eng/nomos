import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import db from '@/lib/db';

export async function POST(request) {
  return withAuth(request, async (user) => {
    const body = await request.json();
    const { operation_id, lot_id, entreprise_id, situation_id, type, motif, reference_ccap, montant, mode } = body;

    if (!type || !motif || !reference_ccap) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const conn = await db();

    const [result] = await conn.query(
      `INSERT INTO penalites (tenant_id, operation_id, lot_id, entreprise_id, situation_id, type, motif, reference_ccap, montant, mode, proposed_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'proposee')`,
      [user.tenant_id, operation_id, lot_id, entreprise_id, situation_id, type, motif, reference_ccap, montant, mode, user.id]
    );

    // Create courrier to MOA
    await conn.query(
      `INSERT INTO courriers (tenant_id, operation_id, type, destinataire_id, destinataire_email, objet, contenu, mode_envoi, envoi_status, date_envoi, lot_id, entreprise_id)
       VALUES (?, ?, 'opc_penalite', ?, ?, ?, ?, 'email', 'envoye', NOW(), ?, ?)`,
      [
        user.tenant_id,
        operation_id,
        1, // MOA user_id
        'moa@example.com',
        `Proposition de pénalité — Lot ${lot_id}`,
        `Monsieur,\n\nNous vous proposons l'application d'une pénalité :\n\nType : ${type}\nMontant : ${montant} €\nRéférence CCAP : ${reference_ccap}\nMotif : ${motif}\n\nCordialement,\nOPC`,
        lot_id,
        entreprise_id
      ]
    );

    await conn.end();

    return NextResponse.json({ success: true, id: result.insertId, message: 'Pénalité proposée au MOA' });
  });
}
