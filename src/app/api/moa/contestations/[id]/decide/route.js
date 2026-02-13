import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email-engine';

export async function POST(request, { params }) {
  try {
    const user = await verifyToken(request);
    
    if (!user || user.role !== 'moa') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const contestationId = params.id;
    const { decision, comment } = await request.json();
    
    if (!['acceptee', 'refusee'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
    }
    
    if (!comment) {
      return NextResponse.json({ error: 'Comment required' }, { status: 400 });
    }
    
    // Get contestation details
    const [contestations] = await pool.query(`
      SELECT 
        c.*,
        l.operation_id,
        l.entreprise_id,
        e.name as entreprise_name,
        e.email as entreprise_email,
        o.tenant_id,
        o.name as operation_name,
        o.moe_name
      FROM contestations c
      JOIN lots l ON c.lot_id = l.id
      JOIN entreprises e ON l.entreprise_id = e.id
      JOIN operations o ON l.operation_id = o.id
      WHERE c.id = ?
      LIMIT 1
    `, [contestationId]);
    
    if (contestations.length === 0) {
      return NextResponse.json({ error: 'Contestation not found' }, { status: 404 });
    }
    
    const contestation = contestations[0];
    
    if (contestation.status !== 'deposee') {
      return NextResponse.json({ error: 'Contestation not in correct status' }, { status: 400 });
    }
    
    // Update contestation
    await pool.query(`
      UPDATE contestations
      SET status = ?,
          decision_moa = ?,
          decided_by_user_id = ?,
          decided_at = NOW()
      WHERE id = ?
    `, [decision, comment, user.id, contestationId]);
    
    // Send notification to entreprise
    await sendEmail({
      tenantId: contestation.tenant_id,
      templateCode: 'ARBITRAGE_ENTREPRISE',
      destinataireEmail: contestation.entreprise_email,
      destinataireName: contestation.entreprise_name,
      variables: {
        entreprise_name: contestation.entreprise_name,
        objet: contestation.objet,
        decision: comment,
        moa_name: user.name
      },
      operationId: contestation.operation_id,
      lotId: contestation.lot_id,
      entrepriseId: contestation.entreprise_id
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deciding contestation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
