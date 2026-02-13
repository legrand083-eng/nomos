import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import pool from '@/lib/db';

export const GET = withAuth(async (req, { user }) => {
  try {
    const [notifications] = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = ? AND tenant_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [user.id, user.tenant_id]
    );

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
