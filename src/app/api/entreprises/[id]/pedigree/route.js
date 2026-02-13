import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import pool from '@/lib/db';

export const GET = withAuth(async (req, { params, user }) => {
  try {
    const entrepriseId = params.id;

    // Get entreprise data with lot info
    const [entreprises] = await pool.query(
      `SELECT e.*, l.number as lot_number, l.name as lot_name, 
              l.montant_ht as montant_marche_ht, o.name as operation_name
       FROM entreprises e
       LEFT JOIN lots l ON e.id = l.entreprise_id
       LEFT JOIN operations o ON l.operation_id = o.id
       WHERE e.id = ? AND e.tenant_id = ?`,
      [entrepriseId, user.tenant_id]
    );

    if (entreprises.length === 0) {
      return NextResponse.json({ error: 'Entreprise not found' }, { status: 404 });
    }

    const entreprise = entreprises[0];

    // Get documents
    const [documents] = await pool.query(
      `SELECT * FROM documents 
       WHERE entreprise_id = ? AND tenant_id = ?
       ORDER BY created_at DESC`,
      [entrepriseId, user.tenant_id]
    );

    // Get sous-traitants (from lots table for now)
    const [sousTraitants] = await pool.query(
      `SELECT * FROM entreprises 
       WHERE parent_entreprise_id = ? AND tenant_id = ?`,
      [entrepriseId, user.tenant_id]
    );

    return NextResponse.json({
      entreprise,
      documents,
      sousTraitants
    });
  } catch (error) {
    console.error('Error fetching pedigree:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
