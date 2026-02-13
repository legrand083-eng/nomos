import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/withAuth';
import pool from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id, section } = params;
    const data = await request.json();

    // Verify operation belongs to user's tenant
    const [operations] = await pool.query(
      `SELECT id FROM operations WHERE id = ? AND tenant_id = ?`,
      [id, user.tenant_id]
    );

    if (operations.length === 0) {
      return NextResponse.json({ error: 'Opération non trouvée' }, { status: 404 });
    }

    let updateQuery = '';
    let updateValues = [];

    switch (section) {
      case 'a': // Identification
        updateQuery = `
          UPDATE operations SET
            operation_type = ?,
            market_type = ?,
            market_form = ?,
            description = ?,
            department = ?,
            region = ?,
            budget_ht = ?,
            budget_ttc = ?,
            nb_lots = ?,
            updated_at = NOW()
          WHERE id = ? AND tenant_id = ?
        `;
        updateValues = [
          data.operation_type,
          data.market_type,
          data.market_form,
          data.description,
          data.department,
          data.region,
          data.budget_ht,
          data.budget_ttc,
          data.nb_lots,
          id,
          user.tenant_id
        ];
        break;

      case 'b': // Juridique
        updateQuery = `
          UPDATE operations SET
            referentiel = ?,
            ccap_uploaded = ?,
            ccap_file_path = ?,
            has_derogations = ?,
            derogations_ccag = ?,
            updated_at = NOW()
          WHERE id = ? AND tenant_id = ?
        `;
        updateValues = [
          data.referentiel,
          data.ccap_uploaded,
          data.ccap_file_path,
          data.has_derogations,
          data.derogations_ccag,
          id,
          user.tenant_id
        ];
        break;

      case 'd': // Planning
        updateQuery = `
          UPDATE operations SET
            date_os1 = ?,
            date_os2 = ?,
            duree_globale_mois = ?,
            duree_preparation_jours = ?,
            date_fin_prevue = ?,
            conges_annuels_debut = ?,
            conges_annuels_fin = ?,
            intemperies_jours_prevus = ?,
            jour_reunion_chantier = ?,
            frequence_reunion = ?,
            date_limite_situation = ?,
            updated_at = NOW()
          WHERE id = ? AND tenant_id = ?
        `;
        updateValues = [
          data.date_os1,
          data.date_os2,
          data.duree_globale_mois,
          data.duree_preparation_jours,
          data.date_fin_prevue,
          data.conges_annuels_debut,
          data.conges_annuels_fin,
          data.intemperies_jours_prevus,
          data.jour_reunion_chantier,
          data.frequence_reunion,
          data.date_limite_situation,
          id,
          user.tenant_id
        ];
        break;

      case 'e': // Financier
        updateQuery = `
          UPDATE operations SET
            rg_rate = ?,
            rg_mode = ?,
            avance_forfaitaire = ?,
            avance_forfaitaire_rate = ?,
            avance_forfaitaire_base = ?,
            avance_remb_debut = ?,
            avance_remb_fin = ?,
            avance_appro = ?,
            avance_appro_rate = ?,
            prorata_mode = ?,
            prorata_rate = ?,
            prorata_gestionnaire = ?,
            revision_prix = ?,
            revision_type = ?,
            penalite_retard_mode = ?,
            penalite_retard_montant = ?,
            penalite_plafond_rate = ?,
            penalite_absence_reunion = ?,
            insertion_sociale = ?,
            insertion_heures_prevues = ?,
            updated_at = NOW()
          WHERE id = ? AND tenant_id = ?
        `;
        updateValues = [
          data.rg_rate,
          data.rg_mode,
          data.avance_forfaitaire,
          data.avance_forfaitaire_rate,
          data.avance_forfaitaire_base,
          data.avance_remb_debut,
          data.avance_remb_fin,
          data.avance_appro,
          data.avance_appro_rate,
          data.prorata_mode,
          data.prorata_rate,
          data.prorata_gestionnaire,
          data.revision_prix,
          data.revision_type,
          data.penalite_retard_mode,
          data.penalite_retard_montant,
          data.penalite_plafond_rate,
          data.penalite_absence_reunion,
          data.insertion_sociale,
          data.insertion_heures_prevues,
          id,
          user.tenant_id
        ];
        break;

      default:
        return NextResponse.json({ error: 'Section invalide' }, { status: 400 });
    }

    await pool.query(updateQuery, updateValues);

    // Calculate and update pedigree completion
    await updatePedigreeCompletion(id, user.tenant_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating pedigree section:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

async function updatePedigreeCompletion(operationId, tenantId) {
  const [operations] = await pool.query(
    `SELECT * FROM operations WHERE id = ? AND tenant_id = ?`,
    [operationId, tenantId]
  );

  if (operations.length === 0) return;

  const op = operations[0];
  let completed = 0;
  let total = 83; // Total questions

  // Section A (9 questions)
  if (op.operation_type) completed++;
  if (op.market_type) completed++;
  if (op.market_form) completed++;
  if (op.description) completed++;
  if (op.department) completed++;
  if (op.region) completed++;
  if (op.budget_ht) completed++;
  if (op.budget_ttc) completed++;
  if (op.nb_lots) completed++;

  // Section B (5 questions)
  if (op.referentiel) completed++;
  if (op.ccap_uploaded !== null) completed++;
  if (op.has_derogations !== null) completed++;
  if (op.has_derogations && op.derogations_ccag) completed++;
  if (!op.has_derogations || op.derogations_ccag) completed++;

  // Section D (11 questions)
  if (op.date_os1) completed++;
  if (op.duree_globale_mois) completed++;
  if (op.duree_preparation_jours !== null) completed++;
  if (op.date_fin_prevue) completed++;
  if (op.conges_annuels_debut) completed++;
  if (op.conges_annuels_fin) completed++;
  if (op.intemperies_jours_prevus !== null) completed++;
  if (op.jour_reunion_chantier) completed++;
  if (op.frequence_reunion) completed++;
  if (op.date_limite_situation) completed++;

  // Section E (20 questions)
  if (op.rg_rate) completed++;
  if (op.rg_mode) completed++;
  if (op.avance_forfaitaire !== null) completed++;
  if (op.avance_forfaitaire_rate) completed++;
  if (op.avance_forfaitaire_base) completed++;
  if (op.avance_remb_debut) completed++;
  if (op.avance_remb_fin) completed++;
  if (op.avance_appro !== null) completed++;
  if (op.prorata_mode) completed++;
  if (op.prorata_rate) completed++;
  if (op.revision_prix !== null) completed++;
  if (op.revision_type) completed++;
  if (op.penalite_retard_mode) completed++;
  if (op.penalite_retard_montant) completed++;
  if (op.penalite_plafond_rate) completed++;
  if (op.penalite_absence_reunion) completed++;
  if (op.insertion_sociale !== null) completed++;

  const percentage = Math.round((completed / total) * 100);

  await pool.query(
    `UPDATE operations SET pedigree_completion = ? WHERE id = ? AND tenant_id = ?`,
    [percentage, operationId, tenantId]
  );
}
