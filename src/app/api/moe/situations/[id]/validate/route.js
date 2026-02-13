import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import db from '@/lib/db';

export async function PUT(request, { params }) {
  return withAuth(request, async (user) => {
    const { id } = params;
    const body = await request.json();
    const { moe_montant_valide, moe_ecart_montant } = body;

    const conn = await db();

    // Update situation
    await conn.query(
      `UPDATE situations 
       SET status = 'validee_moe',
           moe_montant_valide = ?,
           moe_ecart_montant = ?,
           updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [moe_montant_valide, moe_ecart_montant, id, user.tenant_id]
    );

    await conn.end();

    return NextResponse.json({ success: true, message: 'Situation validée financièrement' });
  });
}
