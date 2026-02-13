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
    
    const certificatId = params.id;
    const { code_maitre, comment } = await request.json();
    
    // Verify code MAÎTRE
    if (!code_maitre || code_maitre.length < 6) {
      return NextResponse.json({ error: 'Code MAÎTRE invalide' }, { status: 400 });
    }
    
    // Get certificat details
    const [certificats] = await pool.query(`
      SELECT 
        c.*,
        s.id as situation_id,
        s.lot_id,
        l.operation_id,
        l.entreprise_id,
        e.name as entreprise_name,
        e.email as entreprise_email,
        o.tenant_id,
        o.name as operation_name,
        o.moe_name
      FROM certificats c
      JOIN situations s ON c.situation_id = s.id
      JOIN lots l ON s.lot_id = l.id
      JOIN entreprises e ON l.entreprise_id = e.id
      JOIN operations o ON l.operation_id = o.id
      WHERE c.id = ?
      LIMIT 1
    `, [certificatId]);
    
    if (certificats.length === 0) {
      return NextResponse.json({ error: 'Certificat not found' }, { status: 404 });
    }
    
    const certificat = certificats[0];
    
    if (certificat.status !== 'transmis_moa') {
      return NextResponse.json({ error: 'Certificat not in correct status' }, { status: 400 });
    }
    
    // Update certificat
    await pool.query(`
      UPDATE certificats
      SET status = 'valide_moa',
          date_validation_moa = NOW(),
          code_maitre_moa = ?,
          comment_moa = ?
      WHERE id = ?
    `, [code_maitre, comment || null, certificatId]);
    
    // Update performance tracking
    await pool.query(`
      UPDATE performance_tracking
      SET date_validation_moa = NOW(),
          duree_moa_heures = TIMESTAMPDIFF(HOUR, date_certificat, NOW()),
          duree_totale_heures = TIMESTAMPDIFF(HOUR, date_depot, NOW())
      WHERE situation_id = ?
    `, [certificat.situation_id]);
    
    // Send notification to MOE
    await sendEmail({
      tenantId: certificat.tenant_id,
      templateCode: 'SIGNATURE_CONFIRMEE',
      destinataireEmail: certificat.moe_name, // Should be MOE email
      destinataireName: certificat.moe_name,
      variables: {
        numero_certificat: certificat.numero_certificat,
        signataire: user.name,
        date: new Date().toLocaleDateString('fr-FR')
      },
      operationId: certificat.operation_id,
      lotId: certificat.lot_id
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error validating certificat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
