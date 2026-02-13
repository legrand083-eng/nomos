import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/withAuth';

export async function POST(request) {
  try {
    const user = await verifyToken(request);
    
    if (!user || user.role !== 'moa') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { lot_id, destinataire_email, destinataire_name, objet, contenu, mode_envoi } = await request.json();
    
    if (!lot_id || !destinataire_email || !objet || !contenu) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Insert courrier
    const [result] = await pool.query(`
      INSERT INTO courriers (
        lot_id, destinataire_email, destinataire_name,
        objet, contenu, mode_envoi, envoi_status, date_envoi
      ) VALUES (?, ?, ?, ?, ?, ?, 'envoye', NOW())
    `, [lot_id, destinataire_email, destinataire_name, objet, contenu, mode_envoi || 'email']);
    
    const courrierId = result.insertId;
    
    // In production, this would trigger actual sending via email/AR24/RAR
    // For now, we just mark it as sent
    
    // Get the created courrier
    const [courriers] = await pool.query(
      'SELECT * FROM courriers WHERE id = ?',
      [courrierId]
    );
    
    return NextResponse.json({ courrier: courriers[0] });
  } catch (error) {
    console.error('Error sending courrier:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
