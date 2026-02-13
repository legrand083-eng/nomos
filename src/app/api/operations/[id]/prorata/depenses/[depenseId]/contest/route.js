import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request, { params }) {
  const { depenseId } = params;
  try {
    await pool.query(
      'UPDATE prorata_depenses SET is_contested = TRUE, arbitrage_status = ? WHERE id = ?',
      ['en_cours', depenseId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
