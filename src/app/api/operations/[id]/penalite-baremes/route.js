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
    const [baremes] = await pool.query(
      `SELECT * FROM penalite_baremes WHERE operation_id = ? AND tenant_id = ? ORDER BY type, name`,
      [params.id, token.tenant_id]
    );

    return NextResponse.json({ baremes });
  } catch (error) {
    console.error('Error fetching baremes:', error);
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
      `INSERT INTO penalite_baremes (tenant_id, operation_id, name, type, mode_calcul, taux_jour, montant_forfait, seuil_jours, plafond_pourcent, exoneration_jours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [token.tenant_id, params.id, body.name, body.type, body.mode_calcul, body.taux_jour, body.montant_forfait, body.seuil_jours, body.plafond_pourcent, body.exoneration_jours]
    );

    return NextResponse.json({ id: result.insertId, message: 'Barème créé' });
  } catch (error) {
    console.error('Error creating bareme:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
