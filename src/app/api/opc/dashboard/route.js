import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import db from '@/lib/db';

export async function GET(request) {
  return withAuth(request, async (user) => {
    const { searchParams } = new URL(request.url);
    const operationId = searchParams.get('operation_id');

    if (!operationId) {
      return NextResponse.json({ error: 'operation_id required' }, { status: 400 });
    }

    const conn = await db();

    // KPIs Chantier
    const [operations] = await conn.query(
      `SELECT 
        o.*,
        (SELECT AVG(s.avancement_physique) FROM situations s 
         JOIN lots l ON s.lot_id = l.id 
         WHERE l.operation_id = o.id AND s.status = 'validee_moe') as avancement_global
      FROM operations o 
      WHERE o.id = ? AND o.tenant_id = ?`,
      [operationId, user.tenant_id]
    );

    // Situations en attente de contrôle OPC
    const [situations] = await conn.query(
      `SELECT 
        s.*,
        l.numero as lot_numero,
        l.nom as lot_nom,
        e.nom as entreprise_nom,
        e.id as entreprise_id
      FROM situations s
      JOIN lots l ON s.lot_id = l.id
      JOIN entreprises e ON l.entreprise_id = e.id
      WHERE l.operation_id = ? 
        AND s.tenant_id = ?
        AND s.status = 'controle_opc'
      ORDER BY s.created_at ASC`,
      [operationId, user.tenant_id]
    );

    // Breaking news
    const [news] = await conn.query(
      `SELECT * FROM notifications 
       WHERE operation_id = ? 
         AND tenant_id = ? 
         AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       ORDER BY created_at DESC 
       LIMIT 10`,
      [operationId, user.tenant_id]
    );

    await conn.end();

    return NextResponse.json({
      operation: operations[0] || null,
      situations,
      news,
      kpis: {
        avancement_global: operations[0]?.avancement_global || 0,
        pending_count: situations.length
      }
    });
  });
}
