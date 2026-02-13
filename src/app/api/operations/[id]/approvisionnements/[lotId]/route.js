import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();
    const [appros] = await pool.query(
      `SELECT * FROM approvisionnements WHERE operation_id = ? AND lot_id = ? AND tenant_id = ? ORDER BY date_depot DESC`,
      [params.id, params.lotId, token.tenant_id]
    );

    return NextResponse.json({ approvisionnements: appros });
  } catch (error) {
    console.error('Error fetching approvisionnements:', error);
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
      `INSERT INTO approvisionnements (tenant_id, operation_id, lot_id, designation, montant_ht, date_depot, date_livraison_prevue, taux_avance)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [token.tenant_id, params.id, params.lotId, body.designation, body.montant_ht, body.date_depot, body.date_livraison_prevue, body.taux_avance || 95]
    );

    return NextResponse.json({ id: result.insertId, message: 'Approvisionnement créé' });
  } catch (error) {
    console.error('Error creating approvisionnement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
