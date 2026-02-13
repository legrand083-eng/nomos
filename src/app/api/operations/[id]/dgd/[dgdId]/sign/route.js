import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request, { params }) {
  const { dgdId } = params;
  const body = await request.json();
  try {
    const field = `date_signature_${body.role}`;
    const newStatus = body.role === 'moa' ? 'definitif' : `signe_${body.role}`;
    
    await pool.query(
      `UPDATE dgd SET ${field} = NOW(), status = ? WHERE id = ?`,
      [newStatus, dgdId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
