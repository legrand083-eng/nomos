import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/withAuth';

export async function GET(request, { params }) {
  try {
    const user = await verifyToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const notificationId = params.id;
    
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ? LIMIT 1',
      [notificationId, user.id]
    );
    
    if (notifications.length === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    
    return NextResponse.json({ notification: notifications[0] });
  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await verifyToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const notificationId = params.id;
    
    // Mark as read
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [notificationId, user.id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
