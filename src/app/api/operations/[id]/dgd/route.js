import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM dgd WHERE operation_id = ? ORDER BY created_at DESC',
      [id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { id } = params;
  const body = await request.json();
  try {
    const solde_net_dgd = body.total_travaux_ht + body.total_revision + body.total_penalites - body.retenue_garantie - body.total_avances_remboursees + body.solde_prorata - body.execution_aux_frais;
    
    const [result] = await pool.query(
      `INSERT INTO dgd (tenant_id, operation_id, lot_id, entreprise_id, reception_id, total_travaux_ht, total_revision, total_penalites, retenue_garantie, total_avances_remboursees, solde_prorata, execution_aux_frais, solde_net_dgd, status, date_generation, delai_reponse_entreprise) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [body.tenant_id, id, body.lot_id, body.entreprise_id, body.reception_id, body.total_travaux_ht, body.total_revision, body.total_penalites, body.retenue_garantie, body.total_avances_remboursees, body.solde_prorata, body.execution_aux_frais, solde_net_dgd, 'genere', 30]
    );
    return NextResponse.json({ id: result.insertId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
