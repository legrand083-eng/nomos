import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/withAuth';

export async function GET(request, { params }) {
  try {
    const user = await verifyToken(request);
    
    if (!user || user.role !== 'moa') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const operationId = params.id;
    
    // Get operation details
    const [operations] = await pool.query(`
      SELECT * FROM operations WHERE id = ? AND tenant_id = ? LIMIT 1
    `, [operationId, user.tenant_id]);
    
    if (operations.length === 0) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 });
    }
    
    const operation = operations[0];
    
    // Get lots with aggregated data
    const [lots] = await pool.query(`
      SELECT 
        l.id,
        l.numero,
        l.name,
        l.montant_marche,
        l.status,
        e.id as entreprise_id,
        e.name as entreprise_name,
        e.siret,
        e.pedigree_completion,
        e.assurance_rc_date_fin,
        e.assurance_decennale_date_fin,
        e.caution_date_fin,
        COUNT(DISTINCT s.id) as nb_situations,
        COUNT(DISTINCT CASE WHEN s.status = 'transmis_moa' THEN s.id END) as nb_situations_pending,
        SUM(CASE WHEN c.status IN ('signe_entreprise', 'signe_moe', 'transmis_moa') THEN c.montant_net_a_payer ELSE 0 END) as montant_total_certificats,
        SUM(CASE WHEN c.status = 'transmis_moa' THEN c.montant_net_a_payer ELSE 0 END) as montant_pending
      FROM lots l
      JOIN entreprises e ON l.entreprise_id = e.id
      LEFT JOIN situations s ON l.id = s.lot_id
      LEFT JOIN certificats c ON s.id = c.situation_id
      WHERE l.operation_id = ?
      GROUP BY l.id
      ORDER BY l.numero ASC
    `, [operationId]);
    
    // Get pending certificats
    const [certificats] = await pool.query(`
      SELECT 
        c.id,
        c.numero_certificat,
        c.montant_net_a_payer,
        c.status,
        c.date_signature_moe,
        s.numero as situation_numero,
        l.numero as lot_numero,
        l.name as lot_name,
        e.name as entreprise_name
      FROM certificats c
      JOIN situations s ON c.situation_id = s.id
      JOIN lots l ON s.lot_id = l.id
      JOIN entreprises e ON l.entreprise_id = e.id
      WHERE l.operation_id = ?
        AND c.status = 'transmis_moa'
      ORDER BY c.created_at DESC
    `, [operationId]);
    
    // Get pending penalites
    const [penalites] = await pool.query(`
      SELECT 
        p.id,
        p.type,
        p.montant,
        p.motif,
        p.status,
        p.proposed_at,
        l.numero as lot_numero,
        l.name as lot_name,
        e.name as entreprise_name,
        u.name as proposed_by_name
      FROM penalites p
      JOIN lots l ON p.lot_id = l.id
      JOIN entreprises e ON l.entreprise_id = e.id
      JOIN users u ON p.proposed_by_user_id = u.id
      WHERE l.operation_id = ?
        AND p.status = 'proposee'
      ORDER BY p.proposed_at DESC
    `, [operationId]);
    
    // Get pending contestations
    const [contestations] = await pool.query(`
      SELECT 
        c.id,
        c.objet,
        c.montant_conteste,
        c.status,
        c.created_at,
        l.numero as lot_numero,
        l.name as lot_name,
        e.name as entreprise_name
      FROM contestations c
      JOIN lots l ON c.lot_id = l.id
      JOIN entreprises e ON l.entreprise_id = e.id
      WHERE l.operation_id = ?
        AND c.status = 'deposee'
      ORDER BY c.created_at DESC
    `, [operationId]);
    
    // Get performance stats
    const [performance] = await pool.query(`
      SELECT 
        AVG(duree_opc_heures) as avg_duree_opc,
        AVG(duree_moe_heures) as avg_duree_moe,
        AVG(duree_moa_heures) as avg_duree_moa,
        AVG(duree_totale_heures) as avg_duree_totale,
        COUNT(*) as nb_situations_traitees
      FROM performance_tracking
      WHERE operation_id = ?
        AND date_paiement IS NOT NULL
    `, [operationId]);
    
    return NextResponse.json({
      operation,
      lots,
      certificats,
      penalites,
      contestations,
      performance: performance[0] || {}
    });
  } catch (error) {
    console.error('Error fetching MOA operation dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
