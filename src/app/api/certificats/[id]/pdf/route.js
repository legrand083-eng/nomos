import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import db from '@/lib/db';

export async function GET(request, { params }) {
  return withAuth(request, async (user) => {
    const { id } = params;

    const conn = await db();

    const [certificats] = await conn.query(
      `SELECT * FROM certificats WHERE id = ? AND tenant_id = ?`,
      [id, user.tenant_id]
    );

    await conn.end();

    if (certificats.length === 0) {
      return NextResponse.json({ error: 'Certificat not found' }, { status: 404 });
    }

    // In production, generate PDF using a library like puppeteer or pdfkit
    // For now, return JSON data that can be used to generate PDF client-side
    return NextResponse.json({ 
      success: true, 
      certificat: certificats[0],
      message: 'PDF generation endpoint (to be implemented with puppeteer)' 
    });
  });
}
