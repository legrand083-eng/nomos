import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import pool from '@/lib/db';

export const GET = withAuth(async (req, { params, user }) => {
  try {
    const situationId = params.id;

    const [situations] = await pool.query(
      `SELECT s.*, l.name as lot_name, l.montant_ht as lot_montant_ht,
              e.name as entreprise_name, o.name as operation_name
       FROM situations s
       LEFT JOIN lots l ON s.lot_id = l.id
       LEFT JOIN entreprises e ON s.entreprise_id = e.id
       LEFT JOIN operations o ON s.operation_id = o.id
       WHERE s.id = ? AND s.tenant_id = ?`,
      [situationId, user.tenant_id]
    );

    if (situations.length === 0) {
      return NextResponse.json({ error: 'Situation not found' }, { status: 404 });
    }

    // Get sous-traitants
    const [sousTraitants] = await pool.query(
      `SELECT * FROM situation_sous_traitants 
       WHERE situation_id = ? AND tenant_id = ?`,
      [situationId, user.tenant_id]
    );

    // Get documents
    const [documents] = await pool.query(
      `SELECT * FROM documents 
       WHERE id IN (?, ?)`,
      [situations[0].situation_pdf_id, situations[0].facture_pdf_id]
    );

    return NextResponse.json({
      situation: situations[0],
      sousTraitants,
      documents
    });
  } catch (error) {
    console.error('Error fetching situation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withAuth(async (req, { params, user }) => {
  try {
    const situationId = params.id;
    const data = await req.json();

    // Check if modifiable
    const [situations] = await pool.query(
      'SELECT modifiable FROM situations WHERE id = ? AND tenant_id = ?',
      [situationId, user.tenant_id]
    );

    if (situations.length === 0) {
      return NextResponse.json({ error: 'Situation not found' }, { status: 404 });
    }

    if (!situations[0].modifiable) {
      return NextResponse.json({ error: 'Situation is not modifiable' }, { status: 403 });
    }

    // Update situation
    await pool.query(
      `UPDATE situations 
       SET montant_ht_cumul = ?, montant_ht_mois = ?, montant_st_ht = ?,
           commentaire = ?, modified_count = modified_count + 1
       WHERE id = ? AND tenant_id = ?`,
      [
        data.montant_ht_cumul,
        data.montant_ht_mois,
        data.montant_st_ht,
        data.commentaire,
        situationId,
        user.tenant_id
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating situation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
