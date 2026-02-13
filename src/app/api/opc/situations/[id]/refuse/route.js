import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import db from '@/lib/db';

export async function PUT(request, { params }) {
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
       SET status = 'refusee',
           updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [id, user.tenant_id]
    );

    // Get situation details
    const [situations] = await conn.query(
      `SELECT s.*, l.numero as lot_numero, e.id as entreprise_id, e.nom as entreprise_nom
       FROM situations s
       JOIN lots l ON s.lot_id = l.id
       JOIN entreprises e ON l.entreprise_id = e.id
       WHERE s.id = ? AND s.tenant_id = ?`,
      [id, user.tenant_id]
    );

    const situation = situations[0];

    // Create courrier
    await conn.query(
      `INSERT INTO courriers (tenant_id, operation_id, type, destinataire_id, destinataire_email, objet, contenu, mode_envoi, envoi_status, date_envoi, lot_id, entreprise_id, situation_id)
       VALUES (?, ?, 'opc_refus_definitif', ?, ?, ?, ?, 'rar', 'envoye', NOW(), ?, ?, ?)`,
      [
        user.tenant_id,
        situation.operation_id,
        situation.entreprise_id,
        'entreprise@example.com',
        `Refus situation Lot ${situation.lot_numero}`,
        `Monsieur,\n\nNous vous informons du refus de votre situation de travaux pour le motif suivant :\n\n${motif}\n\nCordialement,\nOPC`,
        situation.lot_id,
        situation.entreprise_id,
        id
      ]
    );

    await conn.end();

    return NextResponse.json({ success: true, message: 'Situation refusée' });
  });
}
