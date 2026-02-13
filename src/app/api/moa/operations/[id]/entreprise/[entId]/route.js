import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/withAuth';

export async function GET(request, { params }) {
  try {
    const user = await verifyToken(request);
    
    if (!user || user.role !== 'moa') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: operationId, entId: entrepriseId } = params;
    
    // Get entreprise details
    const [entreprises] = await pool.query(`
      SELECT e.*, l.id as lot_id, l.numero as lot_numero, l.name as lot_name, l.montant_marche
      FROM entreprises e
      JOIN lots l ON e.id = l.entreprise_id
      WHERE e.id = ? AND l.operation_id = ?
      LIMIT 1
    `, [entrepriseId, operationId]);
    
    if (entreprises.length === 0) {
      return NextResponse.json({ error: 'Entreprise not found' }, { status: 404 });
    }
    
    const entreprise = entreprises[0];
    
    // Get all situations
    const [situations] = await pool.query(`
      SELECT 
        s.*,
        c.id as certificat_id,
        c.numero_certificat,
        c.montant_net_a_payer,
        c.status as certificat_status
      FROM situations s
      LEFT JOIN certificats c ON s.id = c.situation_id
      WHERE s.lot_id = ?
      ORDER BY s.numero DESC
    `, [entreprise.lot_id]);
    
    // Get all documents
    const [documents] = await pool.query(`
      SELECT * FROM documents
      WHERE entreprise_id = ?
      ORDER BY uploaded_at DESC
    `, [entrepriseId]);
    
    // Get all penalites
    const [penalites] = await pool.query(`
      SELECT 
        p.*,
        u.name as proposed_by_name,
        u2.name as decided_by_name
      FROM penalites p
      JOIN users u ON p.proposed_by_user_id = u.id
      LEFT JOIN users u2 ON p.decided_by_user_id = u2.id
      WHERE p.lot_id = ?
      ORDER BY p.proposed_at DESC
    `, [entreprise.lot_id]);
    
    // Get all courriers
    const [courriers] = await pool.query(`
      SELECT * FROM courriers
      WHERE lot_id = ?
      ORDER BY date_envoi DESC
    `, [entreprise.lot_id]);
    
    // Get all contestations
    const [contestations] = await pool.query(`
      SELECT * FROM contestations
      WHERE lot_id = ?
      ORDER BY created_at DESC
    `, [entreprise.lot_id]);
    
    // Get email log
    const [emails] = await pool.query(`
      SELECT el.*, et.code as template_code, et.category
      FROM email_log el
      LEFT JOIN email_templates et ON el.template_id = et.id
      WHERE el.entreprise_id = ?
      ORDER BY el.created_at DESC
      LIMIT 50
    `, [entrepriseId]);
    
    return NextResponse.json({
      entreprise,
      situations,
      documents,
      penalites,
      courriers,
      contestations,
      emails
    });
  } catch (error) {
    console.error('Error fetching MOA entreprise detail:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
