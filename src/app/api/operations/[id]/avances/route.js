import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyToken } from '@/lib/withAuth';

export async function GET(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();
    const [avances] = await pool.query(
      `SELECT a.*, l.name as lot_name, l.montant_ht 
       FROM avances a
       JOIN lots l ON a.lot_id = l.id
       WHERE a.operation_id = ? AND a.tenant_id = ?`,
      [params.id, token.tenant_id]
    );

    return NextResponse.json({ avances });
  } catch (error) {
    console.error('Error fetching avances:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const pool = await getPool();

    const [result] = await pool.query(
      `INSERT INTO avances (tenant_id, operation_id, lot_id, type, taux, base_calcul, montant_avance, seuil_debut_remb, seuil_fin_remb)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [token.tenant_id, params.id, body.lot_id, body.type || 'forfaitaire', body.taux, body.base_calcul, body.montant_avance, body.seuil_debut_remb, body.seuil_fin_remb]
    );

    return NextResponse.json({ id: result.insertId, message: 'Avance créée' });
  } catch (error) {
    console.error('Error creating avance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
