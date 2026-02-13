import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM compte_prorata WHERE operation_id = ?',
      [id]
    );
    return NextResponse.json(rows[0] || null);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  try {
    await pool.query(
      'UPDATE compte_prorata SET mode_repartition = ?, taux_prelevement = ? WHERE operation_id = ?',
      [body.mode_repartition, body.taux_prelevement, id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
