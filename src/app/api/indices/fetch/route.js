import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, mois } = body;

    if (!code || !mois) {
      return NextResponse.json(
        { error: 'Missing required fields: code, mois' },
        { status: 400 }
      );
    }

    // Note: This is a placeholder for INSEE API integration
    // Real implementation would call INSEE SDMX API:
    // URL: https://api.insee.fr/series/BDM/V1/data/SERIES_BDM/{series_id}
    // 
    // For now, we return an error indicating manual entry is required

    return NextResponse.json(
      {
        error: 'INSEE API integration not yet implemented. Please enter the index value manually.',
        code,
        mois
      },
      { status: 501 }
    );

    /* Future implementation:
    
    const connection = await pool.getConnection();

    try {
      // Fetch from INSEE API
      const response = await fetch(
        `https://api.insee.fr/series/BDM/V1/data/SERIES_BDM/${code}?startPeriod=${mois}&endPeriod=${mois}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.INSEE_API_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('INSEE API request failed');
      }

      const data = await response.json();
      const valeur = parseFloat(data.value);
      const is_provisoire = data.provisional || false;

      // Save to database
      await connection.execute(
        `INSERT INTO indices_insee (code, mois, valeur, is_provisoire, source)
         VALUES (?, ?, ?, ?, 'api_insee')
         ON DUPLICATE KEY UPDATE
         valeur = VALUES(valeur),
         is_provisoire = VALUES(is_provisoire),
         source = 'api_insee',
         fetched_at = NOW()`,
        [code, mois, valeur, is_provisoire]
      );

      return NextResponse.json({ success: true, valeur, is_provisoire });
    } finally {
      connection.release();
    }
    */
  } catch (error) {
    console.error('Error fetching INSEE index:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
