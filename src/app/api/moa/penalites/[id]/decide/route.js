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
    
    const penaliteId = params.id;
    const { decision, comment } = await request.json();
    
    if (!['validee_moa', 'refusee_moa'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
    }
    
    if (decision === 'refusee_moa' && !comment) {
      return NextResponse.json({ error: 'Comment required for refusal' }, { status: 400 });
    }
    
    // Get penalite details
    const [penalites] = await pool.query(`
      SELECT 
        p.*,
        l.operation_id,
        l.entreprise_id,
        e.name as entreprise_name,
        e.email as entreprise_email,
        o.tenant_id,
        o.name as operation_name,
        o.moe_name
      FROM penalites p
      JOIN lots l ON p.lot_id = l.id
      JOIN entreprises e ON l.entreprise_id = e.id
      JOIN operations o ON l.operation_id = o.id
      WHERE p.id = ?
      LIMIT 1
    `, [penaliteId]);
    
    if (penalites.length === 0) {
      return NextResponse.json({ error: 'Penalite not found' }, { status: 404 });
    }
    
    const penalite = penalites[0];
    
    if (penalite.status !== 'proposee') {
      return NextResponse.json({ error: 'Penalite not in correct status' }, { status: 400 });
    }
    
    // Update penalite
    await pool.query(`
      UPDATE penalites
      SET status = ?,
          decided_by_user_id = ?,
          decided_at = NOW(),
          decision_comment = ?
      WHERE id = ?
    `, [decision, user.id, comment, penaliteId]);
    
    // If validated, apply to next certificat
    if (decision === 'validee_moa') {
      // Send notification to entreprise
      await sendEmail({
        tenantId: penalite.tenant_id,
        templateCode: 'PENALITE_APPLIQUEE',
        destinataireEmail: penalite.entreprise_email,
        destinataireName: penalite.entreprise_name,
        variables: {
          entreprise_name: penalite.entreprise_name,
          montant: penalite.montant.toLocaleString('fr-FR'),
          lot_name: penalite.lot_name,
          motif: penalite.motif,
          reference: penalite.reference_ccap,
          type: penalite.type,
          moe_name: penalite.moe_name
        },
        operationId: penalite.operation_id,
        lotId: penalite.lot_id,
        entrepriseId: penalite.entreprise_id
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deciding penalite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
