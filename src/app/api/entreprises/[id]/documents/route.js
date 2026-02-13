import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import pool from '@/lib/db';

export const GET = withAuth(async (req, { params, user }) => {
  try {
    const entrepriseId = params.id;

    const [documents] = await pool.query(
      `SELECT * FROM documents 
       WHERE entreprise_id = ? AND tenant_id = ?
       ORDER BY created_at DESC`,
      [entrepriseId, user.tenant_id]
    );

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
