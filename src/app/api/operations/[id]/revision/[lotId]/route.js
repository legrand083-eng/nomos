import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { validateFormula } from '@/lib/revision-engine';

export async function PUT(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: operationId, lotId } = params;
    const body = await request.json();

    // Validate formula (a + b = 1)
    if (!validateFormula(body.partie_fixe, body.partie_variable)) {
      return NextResponse.json(
        { error: 'Invalid formula: partie_fixe + partie_variable must equal 1.00' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Check if formula exists
      const [existing] = await connection.execute(
        'SELECT id FROM revision_formules WHERE tenant_id = ? AND operation_id = ? AND lot_id = ?',
        [auth.tenant_id, operationId, lotId]
      );

      if (existing.length > 0) {
        // Update existing formula
        await connection.execute(
          `UPDATE revision_formules SET
            type = ?,
            indice_code = ?,
            indice_base_value = ?,
            mois_reference = ?,
            partie_fixe = ?,
            partie_variable = ?,
            parametres = ?,
            has_butoir = ?,
            butoir_pourcent = ?,
            has_sauvegarde = ?,
            sauvegarde_seuil = ?,
            revision_negative_applicable = ?,
            validated = ?,
            updated_at = NOW()
           WHERE id = ?`,
          [
            body.type || 'mono_indice',
            body.indice_code || 'BT01',
            body.indice_base_value,
            body.mois_reference,
            body.partie_fixe,
            body.partie_variable,
            body.parametres ? JSON.stringify(body.parametres) : null,
            body.has_butoir || false,
            body.butoir_pourcent || 15.00,
            body.has_sauvegarde || false,
            body.sauvegarde_seuil || 20.00,
            body.revision_negative_applicable !== undefined ? body.revision_negative_applicable : true,
            body.validated || false,
            existing[0].id
          ]
        );

        return NextResponse.json({ success: true, id: existing[0].id });
      } else {
        // Create new formula
        const [result] = await connection.execute(
          `INSERT INTO revision_formules (
            tenant_id, operation_id, lot_id, type, indice_code, indice_base_value, mois_reference,
            partie_fixe, partie_variable, parametres, has_butoir, butoir_pourcent,
            has_sauvegarde, sauvegarde_seuil, revision_negative_applicable, validated
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            auth.tenant_id,
            operationId,
            lotId,
            body.type || 'mono_indice',
            body.indice_code || 'BT01',
            body.indice_base_value,
            body.mois_reference,
            body.partie_fixe,
            body.partie_variable,
            body.parametres ? JSON.stringify(body.parametres) : null,
            body.has_butoir || false,
            body.butoir_pourcent || 15.00,
            body.has_sauvegarde || false,
            body.sauvegarde_seuil || 20.00,
            body.revision_negative_applicable !== undefined ? body.revision_negative_applicable : true,
            body.validated || false
          ]
        );

        return NextResponse.json({ success: true, id: result.insertId });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating revision formula:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
