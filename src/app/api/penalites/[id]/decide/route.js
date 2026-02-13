import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import db from '@/lib/db';

export async function PUT(request, { params }) {
  return withAuth(request, async (user) => {
    const { id } = params;
    const body = await request.json();
    const { decision, motif_refus } = body;

    if (!decision || !['acceptee', 'refusee'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
    }

    const conn = await db();

    await conn.query(
      `UPDATE penalites 
       SET status = ?,
           decided_by = ?,
           decision_date = NOW(),
           motif_refus = ?,
           updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [decision, user.id, motif_refus || null, id, user.tenant_id]
    );

    // Get penalite details
    const [penalites] = await conn.query(
      `SELECT p.*, e.nom as entreprise_nom, e.id as entreprise_id
       FROM penalites p
       JOIN entreprises e ON p.entreprise_id = e.id
       WHERE p.id = ? AND p.tenant_id = ?`,
      [id, user.tenant_id]
    );

    const penalite = penalites[0];

    // Create courrier to entreprise
    await conn.query(
      `INSERT INTO courriers (tenant_id, operation_id, type, destinataire_id, destinataire_email, objet, contenu, mode_envoi, envoi_status, date_envoi, lot_id, entreprise_id)
       VALUES (?, ?, 'moa_decision_penalite', ?, ?, ?, ?, 'rar', 'envoye', NOW(), ?, ?)`,
      [
        user.tenant_id,
        penalite.operation_id,
        penalite.entreprise_id,
        'entreprise@example.com',
        `Décision pénalité — ${decision === 'acceptee' ? 'Acceptée' : 'Refusée'}`,
        `Monsieur,\n\nSuite à la proposition de pénalité, nous vous informons de notre décision : ${decision === 'acceptee' ? 'ACCEPTÉE' : 'REFUSÉE'}.\n\n${decision === 'refusee' && motif_refus ? `Motif du refus : ${motif_refus}` : ''}\n\nCordialement,\nMOA`,
        penalite.lot_id,
        penalite.entreprise_id
      ]
    );

    await conn.end();

    return NextResponse.json({ 
      success: true, 
      message: `Pénalité ${decision}` 
    });
  });
}
