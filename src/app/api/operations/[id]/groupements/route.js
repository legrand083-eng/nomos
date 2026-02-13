import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/withAuth';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { id: operationId } = params;

    const groupements = await query(
      `SELECT g.*, e.name as mandataire_name, l.name as lot_name
       FROM groupements g
       JOIN entreprises e ON g.mandataire_id = e.id
       JOIN lots l ON g.lot_id = l.id
       WHERE g.tenant_id = ? AND g.operation_id = ?
       ORDER BY g.created_at DESC`,
      [user.tenant_id, operationId]
    );

    return NextResponse.json({ groupements });
  } catch (error) {
    console.error('GET /api/operations/[id]/groupements error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { id: operationId } = params;
    const body = await request.json();

    const result = await query(
      'INSERT INTO groupements (tenant_id, operation_id, lot_id, type, mandataire_id, mandataire_solidaire, certificat_mode) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user.tenant_id, operationId, body.lot_id, body.type, body.mandataire_id, body.mandataire_solidaire, body.certificat_mode]
    );

    return NextResponse.json({ id: result.insertId, message: 'Groupement créé' });
  } catch (error) {
    console.error('POST /api/operations/[id]/groupements error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
