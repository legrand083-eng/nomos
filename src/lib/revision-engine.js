// ══════════════════════════════════════════════════════════════
// NOMOΣ — Revision Engine
// Calcul automatique de révision de prix selon indices INSEE
// ══════════════════════════════════════════════════════════════

import pool from './db';

/**
 * Calculate coefficient K based on formula and indices
 * @param {Object} formule - Revision formula object
 * @param {number} indiceBase - Base index value (BT0)
 * @param {number} indiceMois - Current month index value (BT)
 * @returns {number} - Coefficient K
 */
export function calculateK(formule, indiceBase, indiceMois) {
  let K = 1.0;

  if (formule.type === 'mono_indice') {
    // Formula: K = a + b × (BT / BT0)
    const a = parseFloat(formule.partie_fixe);
    const b = parseFloat(formule.partie_variable);
    K = a + b * (indiceMois / indiceBase);
  } else if (formule.type === 'parametrique') {
    // Formula: K = a + SUM(coef_i × indice_i / indice_i_base)
    const a = parseFloat(formule.partie_fixe);
    const parametres = JSON.parse(formule.parametres || '[]');
    
    let sum = 0;
    for (const param of parametres) {
      // Note: In real implementation, we'd fetch each index separately
      // For now, we use the same ratio for all indices
      sum += parseFloat(param.coef) * (indiceMois / indiceBase);
    }
    
    K = a + sum;
  }

  // Store K before butoir for audit
  const kAvantButoir = K;

  // Apply butoir (ceiling clause)
  if (formule.has_butoir) {
    const maxK = 1 + parseFloat(formule.butoir_pourcent) / 100;
    if (K > maxK) {
      K = maxK;
    }
  }

  // Apply negative revision clause
  if (!formule.revision_negative_applicable && K < 1) {
    K = 1.0;
  }

  return {
    K: parseFloat(K.toFixed(6)),
    kAvantButoir: parseFloat(kAvantButoir.toFixed(6)),
    butoirApplique: formule.has_butoir && kAvantButoir > (1 + parseFloat(formule.butoir_pourcent) / 100)
  };
}

/**
 * Calculate revision amount
 * @param {number} K - Coefficient K
 * @param {number} montantTravauxHT - Amount of work (excluding tax)
 * @returns {number} - Revision amount
 */
export function calculateRevision(K, montantTravauxHT) {
  const revisionMontant = montantTravauxHT * (K - 1);
  return parseFloat(revisionMontant.toFixed(2));
}

/**
 * Fetch INSEE index from API or database
 * @param {string} code - Index code (e.g., 'BT01')
 * @param {Date} mois - Month (YYYY-MM-DD)
 * @returns {Object} - Index data {valeur, is_provisoire}
 */
export async function fetchIndiceINSEE(code, mois) {
  const connection = await pool.getConnection();
  
  try {
    // Format month as YYYY-MM-01
    const moisFormatted = new Date(mois).toISOString().slice(0, 10);
    
    // Check if index exists in database
    const [rows] = await connection.execute(
      'SELECT valeur, is_provisoire, source FROM indices_insee WHERE code = ? AND mois = ?',
      [code, moisFormatted]
    );
    
    if (rows.length > 0) {
      return {
        valeur: parseFloat(rows[0].valeur),
        is_provisoire: rows[0].is_provisoire,
        source: rows[0].source
      };
    }
    
    // If not in database, try to fetch from INSEE API
    // Note: This is a placeholder. Real implementation would call INSEE SDMX API
    // URL: https://api.insee.fr/series/BDM/V1/data/SERIES_BDM/{series_id}
    // For now, we return null to indicate index not available
    
    return null;
  } catch (error) {
    console.error('Error fetching INSEE index:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Calculate revision for a situation
 * @param {number} tenantId
 * @param {number} operationId
 * @param {number} lotId
 * @param {number} situationId
 * @param {Date} mois - Month of the situation
 * @param {number} montantTravauxHT - Amount of work for this situation
 * @returns {Object} - Calculation result
 */
export async function calculateRevisionForSituation(tenantId, operationId, lotId, situationId, mois, montantTravauxHT) {
  const connection = await pool.getConnection();
  
  try {
    // Get revision formula for this lot
    const [formules] = await connection.execute(
      'SELECT * FROM revision_formules WHERE tenant_id = ? AND operation_id = ? AND lot_id = ? AND validated = TRUE LIMIT 1',
      [tenantId, operationId, lotId]
    );
    
    if (formules.length === 0) {
      throw new Error('No validated revision formula found for this lot');
    }
    
    const formule = formules[0];
    
    // Get base index
    const indiceBase = parseFloat(formule.indice_base_value);
    
    // Get current month index
    const indiceData = await fetchIndiceINSEE(formule.indice_code, mois);
    
    if (!indiceData) {
      throw new Error(`Index ${formule.indice_code} not available for month ${mois}`);
    }
    
    const indiceMois = indiceData.valeur;
    
    // Calculate K
    const { K, kAvantButoir, butoirApplique } = calculateK(formule, indiceBase, indiceMois);
    
    // Calculate revision amount
    const montantRevision = calculateRevision(K, montantTravauxHT);
    
    // Get cumulative revision (sum of all previous revisions for this lot)
    const [cumuls] = await connection.execute(
      'SELECT COALESCE(SUM(montant_revision), 0) as cumul FROM revision_calculs WHERE tenant_id = ? AND operation_id = ? AND lot_id = ? AND situation_id < ?',
      [tenantId, operationId, lotId, situationId]
    );
    
    const cumulRevision = parseFloat(cumuls[0].cumul) + montantRevision;
    
    // Save calculation
    await connection.execute(
      `INSERT INTO revision_calculs 
       (tenant_id, operation_id, lot_id, situation_id, mois, indice_base, indice_mois, is_indice_provisoire, coefficient_k, montant_travaux_ht, montant_revision, butoir_applique, k_avant_butoir, cumul_revision)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       indice_mois = VALUES(indice_mois),
       is_indice_provisoire = VALUES(is_indice_provisoire),
       coefficient_k = VALUES(coefficient_k),
       montant_travaux_ht = VALUES(montant_travaux_ht),
       montant_revision = VALUES(montant_revision),
       butoir_applique = VALUES(butoir_applique),
       k_avant_butoir = VALUES(k_avant_butoir),
       cumul_revision = VALUES(cumul_revision)`,
      [
        tenantId,
        operationId,
        lotId,
        situationId,
        new Date(mois).toISOString().slice(0, 10),
        indiceBase,
        indiceMois,
        indiceData.is_provisoire,
        K,
        montantTravauxHT,
        montantRevision,
        butoirApplique,
        kAvantButoir,
        cumulRevision
      ]
    );
    
    return {
      K,
      kAvantButoir,
      butoirApplique,
      indiceBase,
      indiceMois,
      isIndiceProvisoire: indiceData.is_provisoire,
      montantTravauxHT,
      montantRevision,
      cumulRevision
    };
  } catch (error) {
    console.error('Error calculating revision:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Validate formula (a + b = 1)
 * @param {number} partieFixe - Fixed part (a)
 * @param {number} partieVariable - Variable part (b)
 * @returns {boolean}
 */
export function validateFormula(partieFixe, partieVariable) {
  const sum = parseFloat(partieFixe) + parseFloat(partieVariable);
  return Math.abs(sum - 1.0) < 0.0001; // Allow small floating point error
}

/**
 * Get available INSEE indices codes
 * @returns {Array} - List of index codes with labels
 */
export function getAvailableIndices() {
  return [
    // BT series (Bâtiment)
    { code: 'BT01', label: 'BT01 - Bâtiment tous corps d\'état' },
    { code: 'BT02', label: 'BT02 - Gros oeuvre' },
    { code: 'BT03', label: 'BT03 - Charpente métallique' },
    { code: 'BT04', label: 'BT04 - Charpente bois' },
    { code: 'BT05', label: 'BT05 - Couverture plomberie' },
    { code: 'BT06', label: 'BT06 - Menuiserie bois' },
    { code: 'BT07', label: 'BT07 - Menuiserie métallique' },
    { code: 'BT08', label: 'BT08 - Serrurerie' },
    { code: 'BT09', label: 'BT09 - Plâtrerie' },
    { code: 'BT10', label: 'BT10 - Peinture' },
    { code: 'BT11', label: 'BT11 - Électricité' },
    { code: 'BT12', label: 'BT12 - Plomberie sanitaire' },
    { code: 'BT13', label: 'BT13 - Chauffage ventilation' },
    { code: 'BT14', label: 'BT14 - Ascenseurs' },
    // TP series (Travaux Publics)
    { code: 'TP01', label: 'TP01 - Travaux publics tous travaux' },
    { code: 'TP02', label: 'TP02 - Terrassements généraux' },
    { code: 'TP03', label: 'TP03 - Terrassements en grande masse' },
    { code: 'TP04', label: 'TP04 - Canalisations d\'eau et d\'assainissement' },
    { code: 'TP05', label: 'TP05 - Canalisations de gaz' },
    { code: 'TP06', label: 'TP06 - Ouvrages d\'art' },
    { code: 'TP07', label: 'TP07 - Voies ferrées' },
    { code: 'TP08', label: 'TP08 - Travaux souterrains' },
    { code: 'TP09', label: 'TP09 - Routes et pistes' },
    { code: 'TP10', label: 'TP10 - Fondations spéciales' },
    { code: 'TP11', label: 'TP11 - Électrification rurale' },
    { code: 'TP12', label: 'TP12 - Lignes électriques aériennes' }
  ];
}
