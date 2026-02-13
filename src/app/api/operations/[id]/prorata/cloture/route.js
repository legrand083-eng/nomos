import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request, { params }) {
  const { id } = params;
  try {
    await pool.query(
      'UPDATE compte_prorata SET status = ? WHERE operation_id = ?',
      ['cloture', id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
