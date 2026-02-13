import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request, { params }) {
  const { receptionId } = params;
  try {
    await pool.query(
      'UPDATE receptions SET status = ? WHERE id = ?',
      ['rg_liberee', receptionId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
