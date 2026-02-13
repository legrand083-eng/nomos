import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { receptionId } = params;
  try {
    const [rows] = await pool.query('SELECT * FROM receptions WHERE id = ?', [receptionId]);
    return NextResponse.json(rows[0] || null);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { receptionId } = params;
  const body = await request.json();
  try {
    await pool.query(
      'UPDATE receptions SET date_levee_reserves = ?, status = ? WHERE id = ?',
      [body.date_levee_reserves, body.status, receptionId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
