import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/withAuth';

export async function GET(request) {
  try {
    const user = await verifyToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unread_only') === 'true';
    
    // Get notifications for this user
    const query = `
      SELECT * FROM notifications
      WHERE user_id = ?
      ${unreadOnly ? 'AND is_read = FALSE' : ''}
      ORDER BY created_at DESC
      LIMIT ?
    `;
    
    const [notifications] = await pool.query(query, [user.id, limit]);
    
    // Get unread count
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [user.id]
    );
    
    return NextResponse.json({
      notifications,
      unread_count: countResult[0].count
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
