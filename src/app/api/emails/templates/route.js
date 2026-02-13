import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/withAuth';

export async function GET(request) {
  try {
    const user = await verifyToken(request);
    
    if (!user || !['admin', 'moe'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let query = 'SELECT * FROM email_templates WHERE tenant_id IS NULL OR tenant_id = ?';
    const params = [user.tenant_id];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY category, code';
    
    const [templates] = await pool.query(query, params);
    
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
