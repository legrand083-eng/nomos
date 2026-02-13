import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM prorata_repartitions WHERE compte_prorata_id = (SELECT id FROM compte_prorata WHERE operation_id = ?)',
      [id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  try {
    for (const rep of body.repartitions) {
      await pool.query(
        'UPDATE prorata_repartitions SET part_pourcent = ? WHERE id = ?',
        [rep.part_pourcent, rep.id]
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
