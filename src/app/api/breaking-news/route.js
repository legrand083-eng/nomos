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

    const [news] = await conn.query(
      `SELECT * FROM notifications 
       WHERE operation_id = ? 
         AND tenant_id = ? 
         AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       ORDER BY created_at DESC 
       LIMIT 15`,
      [operationId, user.tenant_id]
    );

    await conn.end();

    return NextResponse.json({ news });
  });
}
