import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM prorata_depenses WHERE compte_prorata_id = (SELECT id FROM compte_prorata WHERE operation_id = ?) ORDER BY date_depense DESC',
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
    const [compte] = await pool.query('SELECT id, tenant_id FROM compte_prorata WHERE operation_id = ?', [id]);
    const [result] = await pool.query(
      'INSERT INTO prorata_depenses (tenant_id, compte_prorata_id, date_depense, designation, categorie, montant_ht, entreprise_fautive_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [compte[0].tenant_id, compte[0].id, body.date_depense, body.designation, body.categorie, body.montant_ht, body.entreprise_fautive_id]
    );
    return NextResponse.json({ id: result.insertId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
