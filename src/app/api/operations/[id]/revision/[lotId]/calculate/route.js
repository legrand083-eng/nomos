import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/withAuth';
import { calculateRevisionForSituation } from '@/lib/revision-engine';

export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: operationId, lotId } = params;
    const body = await request.json();
    const { situationId, mois, montantTravauxHT } = body;

    if (!situationId || !mois || montantTravauxHT === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: situationId, mois, montantTravauxHT' },
        { status: 400 }
      );
    }

    const result = await calculateRevisionForSituation(
      auth.tenant_id,
      operationId,
      lotId,
      situationId,
      mois,
      montantTravauxHT
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error calculating revision:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
