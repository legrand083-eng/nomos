import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { dgdId } = params;
  try {
    const [rows] = await pool.query('SELECT * FROM dgd WHERE id = ?', [dgdId]);
    return NextResponse.json(rows[0] || null);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
