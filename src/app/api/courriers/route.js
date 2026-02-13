import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import db from '@/lib/db';

export async function POST(request) {
  return withAuth(request, async (user) => {
    const body = await request.json();
    const { 
      operation_id, 
      type, 
      destinataire_id, 
      destinataire_email, 
      objet, 
      contenu, 
      mode_envoi,
      lot_id,
      entreprise_id,
      situation_id
    } = body;

    if (!type || !destinataire_email || !objet || !contenu) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const conn = await db();

    const [result] = await conn.query(
      `INSERT INTO courriers (
        tenant_id, operation_id, type, destinataire_id, destinataire_email, 
        objet, contenu, mode_envoi, envoi_status, date_envoi, 
        lot_id, entreprise_id, situation_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'envoye', NOW(), ?, ?, ?)`,
      [
        user.tenant_id,
        operation_id,
        type,
        destinataire_id,
        destinataire_email,
        objet,
        contenu,
        mode_envoi || 'email',
        lot_id || null,
        entreprise_id || null,
        situation_id || null
      ]
    );

    await conn.end();

    return NextResponse.json({ 
      success: true, 
      id: result.insertId,
      message: 'Courrier envoyé avec succès' 
    });
  });
}

export async function GET(request) {
  return withAuth(request, async (user) => {
    const { searchParams } = new URL(request.url);
    const operationId = searchParams.get('operation_id');

    const conn = await db();

    const [courriers] = await conn.query(
      `SELECT * FROM courriers 
       WHERE operation_id = ? AND tenant_id = ?
       ORDER BY date_envoi DESC`,
      [operationId, user.tenant_id]
    );

    await conn.end();

    return NextResponse.json({ courriers });
  });
}
