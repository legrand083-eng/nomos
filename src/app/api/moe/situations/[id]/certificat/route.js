import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(request, { params }) {
  return withAuth(request, async (user) => {
    const { id } = params;

    const conn = await db();

    // Get situation details
    const [situations] = await conn.query(
      `SELECT s.*, l.*, e.nom as entreprise_nom, e.siret as entreprise_siret, o.nom as operation_nom
       FROM situations s
       JOIN lots l ON s.lot_id = l.id
       JOIN entreprises e ON l.entreprise_id = e.id
       JOIN operations o ON l.operation_id = o.id
       WHERE s.id = ? AND s.tenant_id = ?`,
      [id, user.tenant_id]
    );

    const situation = situations[0];

    // Calculate certificat values
    const montantMoisHT = situation.moe_montant_valide - situation.montant_cumul_precedent;
    const montantTVA = situation.tva_autoliquidation ? 0 : montantMoisHT * (situation.tva_rate / 100);
    const montantTTC = montantMoisHT + montantTVA;
    const rgAfterTVA = montantTTC * (situation.retenue_garantie_rate / 100);
    const netAPayer = montantTTC - rgAfterTVA - (situation.penalites_montant || 0);

    // Generate certificat numero
    const [lastCert] = await conn.query(
      `SELECT numero FROM certificats WHERE tenant_id = ? ORDER BY id DESC LIMIT 1`,
      [user.tenant_id]
    );
    const nextNumero = lastCert.length > 0 ? parseInt(lastCert[0].numero) + 1 : 1;

    // Create certificat
    const [result] = await conn.query(
      `INSERT INTO certificats (
        tenant_id, operation_id, lot_id, entreprise_id, situation_id, numero,
        mois_reference, montant_marche_initial, montant_marche_total, montant_cumul_precedent,
        montant_cumul_actuel, montant_mois_ht, tva_rate, tva_autoliquidation, montant_tva,
        montant_ttc, retenue_garantie_rate, rg_after_tva, penalites_montant, net_a_payer,
        status, is_provisoire, moe_name, moe_siret, moa_name, entreprise_name, entreprise_siret,
        lot_numero, lot_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'brouillon', 1, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.tenant_id,
        situation.operation_id,
        situation.lot_id,
        situation.entreprise_id,
        id,
        nextNumero.toString().padStart(6, '0'),
        situation.mois_reference,
        situation.montant_marche_initial,
        situation.montant_marche_total,
        situation.montant_cumul_precedent,
        situation.moe_montant_valide,
        montantMoisHT,
        situation.tva_rate,
        situation.tva_autoliquidation,
        montantTVA,
        montantTTC,
        situation.retenue_garantie_rate,
        rgAfterTVA,
        situation.penalites_montant || 0,
        netAPayer,
        'MOE Company',
        '12345678901234',
        'MOA Company',
        situation.entreprise_nom,
        situation.entreprise_siret,
        situation.numero,
        situation.nom
      ]
    );

    // Update situation status
    await conn.query(
      `UPDATE situations 
       SET status = 'certificat_genere',
           certificat_id = ?,
           updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [result.insertId, id, user.tenant_id]
    );

    await conn.end();

    return NextResponse.json({ 
      success: true, 
      certificat_id: result.insertId,
      message: 'Certificat généré avec succès' 
    });
  });
}
