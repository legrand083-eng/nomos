import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/withAuth';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;

    // Get operation with all pedigree fields
    const [operations] = await pool.query(
      `SELECT * FROM operations WHERE id = ? AND tenant_id = ?`,
      [id, user.tenant_id]
    );

    if (operations.length === 0) {
      return NextResponse.json({ error: 'Opération non trouvée' }, { status: 404 });
    }

    const operation = operations[0];

    // Get intervenants
    const [intervenants] = await pool.query(
      `SELECT * FROM intervenants WHERE operation_id = ? AND tenant_id = ? ORDER BY sort_order`,
      [id, user.tenant_id]
    );

    // Get jalons
    const [jalons] = await pool.query(
      `SELECT * FROM jalons WHERE operation_id = ? AND tenant_id = ? ORDER BY date_prevue`,
      [id, user.tenant_id]
    );

    // Get lots with entreprises
    const [lots] = await pool.query(
      `SELECT l.*, e.name as entreprise_name, e.siret as entreprise_siret
       FROM lots l
       LEFT JOIN entreprises e ON l.entreprise_id = e.id
       WHERE l.operation_id = ? AND l.tenant_id = ?
       ORDER BY l.number`,
      [id, user.tenant_id]
    );

    const pedigree = {
      operation,
      intervenants,
      jalons,
      lots
    };

    return NextResponse.json(pedigree);
  } catch (error) {
    console.error('Error fetching pedigree:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
