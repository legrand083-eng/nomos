import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/withAuth';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { stId } = params;
    const docs = await query(
      'SELECT * FROM st_documents WHERE tenant_id = ? AND sous_traitant_id = ? ORDER BY type',
      [user.tenant_id, stId]
    );

    return NextResponse.json({ documents: docs });
  } catch (error) {
    console.error('GET /api/operations/[id]/sous-traitants/[stId]/documents error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { stId } = params;
    const body = await request.json();

    const result = await query(
      'INSERT INTO st_documents (tenant_id, sous_traitant_id, type, file_path, expires_at) VALUES (?, ?, ?, ?, ?)',
      [user.tenant_id, stId, body.type, body.file_path, body.expires_at || null]
    );

    return NextResponse.json({ id: result.insertId, message: 'Document ajouté' });
  } catch (error) {
    console.error('POST /api/operations/[id]/sous-traitants/[stId]/documents error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
