import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import db from '@/lib/db';

export async function POST(request, { params }) {
  return withAuth(request, async (user) => {
    const { id } = params;

    const conn = await db();

    await conn.query(
      `UPDATE certificats 
       SET status = 'transmis_moa',
           updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [id, user.tenant_id]
    );

    // Get certificat details
    const [certificats] = await conn.query(
      `SELECT * FROM certificats WHERE id = ? AND tenant_id = ?`,
      [id, user.tenant_id]
    );

    const certificat = certificats[0];

    // Create courrier to MOA
    await conn.query(
      `INSERT INTO courriers (tenant_id, operation_id, type, destinataire_id, destinataire_email, objet, contenu, mode_envoi, envoi_status, date_envoi, lot_id, entreprise_id)
       VALUES (?, ?, 'moe_transmission_moa', ?, ?, ?, ?, 'email', 'envoye', NOW(), ?, ?)`,
      [
        user.tenant_id,
        certificat.operation_id,
        1, // MOA user_id
        'moa@example.com',
        `Certificat de paiement N° ${certificat.numero}`,
        `Monsieur,\n\nVeuillez trouver ci-joint le certificat de paiement N° ${certificat.numero}.\n\nMontant net à payer : ${certificat.net_a_payer} €\n\nCordialement,\nMOE`,
        certificat.lot_id,
        certificat.entreprise_id
      ]
    );

    await conn.end();

    return NextResponse.json({ success: true, message: 'Certificat transmis au MOA' });
  });
}
