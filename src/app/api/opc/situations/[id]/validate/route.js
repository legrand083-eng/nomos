import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import db from '@/lib/db';

export async function PUT(request, { params }) {
  return withAuth(request, async (user) => {
    const { id } = params;
    const body = await request.json();
    const { opc_avancement_valide, opc_ecart_planning } = body;

    const conn = await db();

    // Update situation
    await conn.query(
      `UPDATE situations 
       SET status = 'controle_moe',
           opc_avancement_valide = ?,
           opc_ecart_planning = ?,
           opc_alerte_type = 'none',
           updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [opc_avancement_valide, opc_ecart_planning, id, user.tenant_id]
    );

    // Get situation details for notification
    const [situations] = await conn.query(
      `SELECT s.*, l.numero as lot_numero, e.nom as entreprise_nom, e.id as entreprise_id
       FROM situations s
       JOIN lots l ON s.lot_id = l.id
       JOIN entreprises e ON l.entreprise_id = e.id
       WHERE s.id = ? AND s.tenant_id = ?`,
      [id, user.tenant_id]
    );

    const situation = situations[0];

    // Create notification
    await conn.query(
      `INSERT INTO notifications (tenant_id, user_id, operation_id, type, title, message, priority)
       VALUES (?, ?, ?, 'situation_validee', ?, ?, 'normal')`,
      [
        user.tenant_id,
        situation.entreprise_id,
        situation.operation_id,
        `Lot ${situation.lot_numero} validé à ${opc_avancement_valide}%`,
        `${situation.entreprise_nom} — Validation OPC`
      ]
    );

    // Create courrier
    await conn.query(
      `INSERT INTO courriers (tenant_id, operation_id, type, destinataire_id, destinataire_email, objet, contenu, mode_envoi, envoi_status, date_envoi, lot_id, entreprise_id, situation_id)
       VALUES (?, ?, 'opc_validation', ?, ?, ?, ?, 'email', 'envoye', NOW(), ?, ?, ?)`,
      [
        user.tenant_id,
        situation.operation_id,
        situation.entreprise_id,
        'entreprise@example.com',
        `Validation avancement Lot ${situation.lot_numero}`,
        `Monsieur,\n\nNous vous informons que la situation de travaux a été contrôlée et validée.\n\nAvancement validé : ${opc_avancement_valide}%\n\nLe dossier est transmis pour contrôle financier.\n\nCordialement,\nOPC`,
        situation.lot_id,
        situation.entreprise_id,
        id
      ]
    );

    await conn.end();

    return NextResponse.json({ success: true, message: 'Situation validée et transmise au MOE' });
  });
}
