import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/withAuth';

export async function GET(request, { params }) {
  try {
    const user = await verifyToken(request);
    
    if (!user || !['admin', 'moe'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const templateId = params.id;
    
    const [templates] = await pool.query(
      'SELECT * FROM email_templates WHERE id = ? LIMIT 1',
      [templateId]
    );
    
    if (templates.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    return NextResponse.json({ template: templates[0] });
  } catch (error) {
    console.error('Error fetching email template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await verifyToken(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const templateId = params.id;
    const { objet_template, contenu_template, is_active } = await request.json();
    
    await pool.query(
      `UPDATE email_templates
       SET objet_template = ?, contenu_template = ?, is_active = ?
       WHERE id = ?`,
      [objet_template, contenu_template, is_active, templateId]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating email template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
