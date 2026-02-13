import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM receptions WHERE operation_id = ? ORDER BY date_reception DESC',
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
    const date_fin_garantie_parfait = new Date(body.date_reception);
    date_fin_garantie_parfait.setFullYear(date_fin_garantie_parfait.getFullYear() + 1);
    
    const date_liberation_rg = body.has_reserves && body.date_levee_reserves 
      ? new Date(body.date_levee_reserves)
      : new Date(body.date_reception);
    
    const date_fin_decennale = new Date(body.date_reception);
    date_fin_decennale.setFullYear(date_fin_decennale.getFullYear() + 10);

    const [result] = await pool.query(
      `INSERT INTO receptions (tenant_id, operation_id, lot_id, entreprise_id, type, perimetre, date_reception, has_reserves, date_levee_reserves, date_fin_garantie_parfait, date_liberation_rg, date_fin_decennale, delai_notification_retenues, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [body.tenant_id, id, body.lot_id, body.entreprise_id, body.type, body.perimetre, body.date_reception, body.has_reserves, body.date_levee_reserves, date_fin_garantie_parfait, date_liberation_rg, date_fin_decennale, 30, 'enregistree']
    );
    return NextResponse.json({ id: result.insertId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
