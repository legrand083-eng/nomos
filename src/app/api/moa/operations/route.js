import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/withAuth';

export async function GET(request) {
  try {
    const user = await verifyToken(request);
    
    if (!user || user.role !== 'moa') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all operations for this tenant
    const [operations] = await pool.query(`
      SELECT 
        o.id,
        o.name,
        o.code,
        o.status,
        o.date_debut,
        o.date_fin_prevue,
        o.montant_total_marche,
        o.moe_name,
        COUNT(DISTINCT l.id) as nb_lots,
        COUNT(DISTINCT e.id) as nb_entreprises,
        COUNT(DISTINCT s.id) as nb_situations_total,
        COUNT(DISTINCT CASE WHEN s.status = 'en_attente_opc' THEN s.id END) as nb_situations_pending,
        COUNT(DISTINCT CASE WHEN c.status = 'transmis_moa' THEN c.id END) as nb_certificats_pending,
        SUM(c.montant_net_a_payer) as montant_total_certificats
      FROM operations o
      LEFT JOIN lots l ON o.id = l.operation_id
      LEFT JOIN entreprises e ON l.entreprise_id = e.id
      LEFT JOIN situations s ON l.id = s.lot_id
      LEFT JOIN certificats c ON s.id = c.situation_id
      WHERE o.tenant_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [user.tenant_id]);
    
    return NextResponse.json({ operations });
  } catch (error) {
    console.error('Error fetching MOA operations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
