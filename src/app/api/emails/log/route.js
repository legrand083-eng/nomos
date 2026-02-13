import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/withAuth';

export async function GET(request) {
  try {
    const user = await verifyToken(request);
    
    if (!user || !['admin', 'moe', 'moa'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const operationId = searchParams.get('operation_id');
    const entrepriseId = searchParams.get('entreprise_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    let query = `
      SELECT el.*, et.code as template_code, et.category
      FROM email_log el
      LEFT JOIN email_templates et ON el.template_id = et.id
      WHERE el.tenant_id = ?
    `;
    const params = [user.tenant_id];
    
    if (operationId) {
      query += ' AND el.operation_id = ?';
      params.push(operationId);
    }
    
    if (entrepriseId) {
      query += ' AND el.entreprise_id = ?';
      params.push(entrepriseId);
    }
    
    query += ' ORDER BY el.created_at DESC LIMIT ?';
    params.push(limit);
    
    const [logs] = await pool.query(query, params);
    
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching email log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
