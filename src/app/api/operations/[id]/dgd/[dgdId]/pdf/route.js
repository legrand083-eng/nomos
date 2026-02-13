import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { dgdId } = params;
  try {
    // TODO: Generate PDF
    return NextResponse.json({ pdf_url: '/placeholder-dgd.pdf' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
