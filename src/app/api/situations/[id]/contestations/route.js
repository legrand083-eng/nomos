import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import pool from '@/lib/db';

export const POST = withAuth(async (req, { params, user }) => {
  try {
    const situationId = params.id;
    const data = await req.json();

    // Get situation details
    const [situations] = await pool.query(
      `SELECT entreprise_id FROM situations 
       WHERE id = ? AND tenant_id = ?`,
      [situationId, user.tenant_id]
    );

    if (situations.length === 0) {
      return NextResponse.json({ error: 'Situation not found' }, { status: 404 });
    }

    // Create contestation
    const [result] = await pool.query(
      `INSERT INTO contestations (
        tenant_id, situation_id, entreprise_id, motif, montant_conteste, status
      ) VALUES (?, ?, ?, ?, ?, 'ouverte')`,
      [
        user.tenant_id,
        situationId,
        situations[0].entreprise_id,
        data.motif,
        data.montant_conteste || null
      ]
    );

    // Update situation status
    await pool.query(
      `UPDATE situations 
       SET status = 'contestee' 
       WHERE id = ? AND tenant_id = ?`,
      [situationId, user.tenant_id]
    );

    return NextResponse.json({
      id: result.insertId,
      success: true
    });
  } catch (error) {
    console.error('Error creating contestation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
