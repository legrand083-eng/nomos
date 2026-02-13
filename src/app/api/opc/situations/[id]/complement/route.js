import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import db from '@/lib/db';

export async function POST(request, { params }) {
  return withAuth(request, async (user) => {
    const { id } = params;
    const body = await request.json();
    const { motif } = body;

    if (!motif) {
      return NextResponse.json({ error: 'Motif required' }, { status: 400 });
    }

    const conn = await db();

    await conn.query(
      `UPDATE situations 
       SET status = 'complement_requis',
           updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [id, user.tenant_id]
    );

    const [situations] = await conn.query(
      `SELECT s.*, l.numero as lot_numero, e.id as entreprise_id
       FROM situations s
       JOIN lots l ON s.lot_id = l.id
       JOIN entreprises e ON l.entreprise_id = e.id
       WHERE s.id = ? AND s.tenant_id = ?`,
      [id, user.tenant_id]
    );

    const situation = situations[0];

    await conn.query(
      `INSERT INTO courriers (tenant_id, operation_id, type, destinataire_id, destinataire_email, objet, contenu, mode_envoi, envoi_status, date_envoi, lot_id, entreprise_id, situation_id)
       VALUES (?, ?, 'opc_demande_complement', ?, ?, ?, ?, 'email', 'envoye', NOW(), ?, ?, ?)`,
      [
        user.tenant_id,
        situation.operation_id,
        situation.entreprise_id,
        'entreprise@example.com',
        `Demande de complément — Lot ${situation.lot_numero}`,
        `Monsieur,\n\nSuite au contrôle de votre situation de travaux, nous vous demandons de bien vouloir fournir les compléments suivants :\n\n${motif}\n\nCordialement,\nOPC`,
        situation.lot_id,
        situation.entreprise_id,
        id
      ]
    );

    await conn.end();

    return NextResponse.json({ success: true, message: 'Demande de complément envoyée' });
  });
}
