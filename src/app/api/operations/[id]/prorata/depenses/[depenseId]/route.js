import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(request, { params }) {
  const { depenseId } = params;
  try {
    await pool.query('DELETE FROM prorata_depenses WHERE id = ?', [depenseId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
