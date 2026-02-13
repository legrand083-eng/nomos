import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import pool from '@/lib/db';

export const PUT = withAuth(async (req, { params, user }) => {
  try {
    const { notifId } = params;

    await pool.query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE id = ? AND user_id = ? AND tenant_id = ?`,
      [notifId, user.id, user.tenant_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
