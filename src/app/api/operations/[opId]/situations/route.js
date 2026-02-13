import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import pool from '@/lib/db';

export const GET = withAuth(async (req, { params, user }) => {
  try {
    const operationId = params.opId;

    const [situations] = await pool.query(
      `SELECT s.*, l.name as lot_name, e.name as entreprise_name
       FROM situations s
       LEFT JOIN lots l ON s.lot_id = l.id
       LEFT JOIN entreprises e ON s.entreprise_id = e.id
       WHERE s.operation_id = ? AND s.tenant_id = ?
       ORDER BY s.numero DESC`,
      [operationId, user.tenant_id]
    );

    return NextResponse.json({ situations });
  } catch (error) {
    console.error('Error fetching situations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withAuth(async (req, { params, user }) => {
  try {
    const operationId = params.opId;
    const data = await req.json();

    // Get next numero
    const [lastSituation] = await pool.query(
      `SELECT MAX(numero) as max_numero FROM situations 
       WHERE operation_id = ? AND lot_id = ? AND tenant_id = ?`,
      [operationId, data.lot_id, user.tenant_id]
    );

    const nextNumero = (lastSituation[0]?.max_numero || 0) + 1;

    // Insert situation
    const [result] = await pool.query(
      `INSERT INTO situations (
        tenant_id, operation_id, lot_id, entreprise_id, numero, 
        mois_reference, montant_ht_cumul, montant_ht_mois, montant_st_ht,
        commentaire, status, modifiable
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'brouillon', TRUE)`,
      [
        user.tenant_id,
        operationId,
        data.lot_id,
        data.entreprise_id,
        nextNumero,
        data.mois_reference,
        data.montant_ht_cumul || 0,
        data.montant_ht_mois || 0,
        data.montant_st_ht || 0,
        data.commentaire || null
      ]
    );

    return NextResponse.json({
      id: result.insertId,
      numero: nextNumero
    });
  } catch (error) {
    console.error('Error creating situation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
