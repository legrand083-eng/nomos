import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import db from '@/lib/db';

export async function POST(request, { params }) {
  return withAuth(request, async (user) => {
    const { id } = params;
    const body = await request.json();
    const { code_maitre, role } = body;

    if (!code_maitre || !role) {
      return NextResponse.json({ error: 'code_maitre and role required' }, { status: 400 });
    }

    const conn = await db();

    // Verify code MAÎTRE (simplified - in production, use proper crypto)
    const expectedCode = `${role.substring(0, 3).toUpperCase()}${id.toString().padStart(3, '0')}`;
    
    if (code_maitre !== expectedCode) {
      await conn.end();
      return NextResponse.json({ error: 'Code MAÎTRE invalide' }, { status: 403 });
    }

    // Update certificat with signature
    const updateField = role === 'entreprise' ? 'date_signature_entreprise' :
                       role === 'moe' ? 'date_signature_moe' : 'date_validation_moa';
    const codeField = role === 'entreprise' ? 'code_signature_entreprise' :
                     role === 'moe' ? 'code_signature_moe' : 'code_validation_moa';

    await conn.query(
      `UPDATE certificats 
       SET ${updateField} = NOW(),
           ${codeField} = ?,
           status = CASE 
             WHEN ? = 'entreprise' THEN 'signe_entreprise'
             WHEN ? = 'moe' THEN 'signe_moe'
             WHEN ? = 'moa' THEN 'valide_moa'
             ELSE status
           END,
           is_provisoire = 0,
           updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [code_maitre, role, role, role, id, user.tenant_id]
    );

    await conn.end();

    return NextResponse.json({ 
      success: true, 
      message: `Certificat signé par ${role}` 
    });
  });
}
