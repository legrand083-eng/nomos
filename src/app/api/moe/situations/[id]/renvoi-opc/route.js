import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import db from '@/lib/db';

export async function PUT(request, { params }) {
  return withAuth(request, async (user) => {
    const { id } = params;
    const body = await request.json();
    const { motif } = body;

    if (!motif) {
      return NextResponse.json({ error: 'Motif required' }, { status: 400 });
    }

    const conn = await db();

    await conn.query(
      `UPDATE situations 
       SET status = 'controle_opc',
           updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [id, user.tenant_id]
    );

    await conn.end();

    return NextResponse.json({ success: true, message: 'Situation renvoyée à l\'OPC' });
  });
}
