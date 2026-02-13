import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/withAuth';
import { fetchIndiceINSEE } from '@/lib/revision-engine';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const mois = searchParams.get('mois');

    if (!code || !mois) {
      return NextResponse.json(
        { error: 'Missing required parameters: code, mois' },
        { status: 400 }
      );
    }

    const indiceData = await fetchIndiceINSEE(code, mois);

    if (!indiceData) {
      return NextResponse.json(
        { error: `Index ${code} not available for month ${mois}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ indice: indiceData });
  } catch (error) {
    console.error('Error fetching index:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, mois, valeur, is_provisoire } = body;

    if (!code || !mois || valeur === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: code, mois, valeur' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      await connection.execute(
        `INSERT INTO indices_insee (code, mois, valeur, is_provisoire, source)
         VALUES (?, ?, ?, ?, 'manual')
         ON DUPLICATE KEY UPDATE
         valeur = VALUES(valeur),
         is_provisoire = VALUES(is_provisoire),
         source = 'manual',
         fetched_at = NOW()`,
        [code, mois, valeur, is_provisoire || false]
      );

      return NextResponse.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error saving index:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
