import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const user = await verifyToken(request);
    
    if (!user || user.role !== 'moa') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const operationId = params.id;
    
    // Get all performance tracking entries
    const [entries] = await pool.query(`
      SELECT 
        pt.*,
        s.numero as situation_numero,
        l.numero as lot_numero,
        l.name as lot_name,
        e.name as entreprise_name
      FROM performance_tracking pt
      JOIN situations s ON pt.situation_id = s.id
      JOIN lots l ON pt.lot_id = l.id
      JOIN entreprises e ON l.entreprise_id = e.id
      WHERE pt.operation_id = ?
      ORDER BY pt.date_depot DESC
    `, [operationId]);
    
    // Calculate aggregated stats
    const [stats] = await pool.query(`
      SELECT 
        AVG(duree_opc_heures) as avg_opc,
        AVG(duree_moe_heures) as avg_moe,
        AVG(duree_moa_heures) as avg_moa,
        AVG(duree_totale_heures) as avg_total,
        MIN(duree_totale_heures) as min_total,
        MAX(duree_totale_heures) as max_total,
        COUNT(*) as nb_situations
      FROM performance_tracking
      WHERE operation_id = ?
        AND date_paiement IS NOT NULL
    `, [operationId]);
    
    // Get monthly breakdown
    const [monthly] = await pool.query(`
      SELECT 
        DATE_FORMAT(date_depot, '%Y-%m') as mois,
        COUNT(*) as nb_situations,
        AVG(duree_totale_heures) as avg_duree,
        SUM(CASE WHEN duree_totale_heures <= 168 THEN 1 ELSE 0 END) as nb_dans_delai
      FROM performance_tracking
      WHERE operation_id = ?
        AND date_paiement IS NOT NULL
      GROUP BY DATE_FORMAT(date_depot, '%Y-%m')
      ORDER BY mois DESC
    `, [operationId]);
    
    return NextResponse.json({
      entries,
      stats: stats[0] || {},
      monthly
    });
  } catch (error) {
    console.error('Error fetching performance tracking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
