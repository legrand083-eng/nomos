/**
 * NOMOΣ — Pénalité Engine
 * Moteur de calcul des pénalités de retard et plafonds
 * Conforme CCAG 2021 + CCAP
 */

/**
 * Calcule le montant d'une pénalité selon le barème
 * @param {object} bareme - Barème de pénalité
 * @param {number} nbJours - Nombre de jours de retard
 * @param {number} montantMarche - Montant du marché (pour % calculation)
 * @param {number} montantSituation - Montant de la situation (pour % calculation)
 * @returns {number} Montant de la pénalité
 */
export function calculatePenalite(bareme, nbJours = 0, montantMarche = 0, montantSituation = 0) {
  let montant = 0;

  switch (bareme.mode_calcul) {
    case 'par_jour':
      montant = bareme.montant_unitaire * nbJours;
      break;

    case 'par_semaine':
      const nbSemaines = Math.ceil(nbJours / 7);
      montant = bareme.montant_unitaire * nbSemaines;
      break;

    case 'forfait':
      montant = bareme.montant_unitaire;
      break;

    case 'pourcentage':
      let base = 0;
      if (bareme.base_pourcentage === 'marche_ht') {
        base = montantMarche;
      } else if (bareme.base_pourcentage === 'situation_ht') {
        base = montantSituation;
      } else {
        base = bareme.montant_unitaire; // forfait
      }
      montant = base * (bareme.montant_unitaire / 100);
      break;

    default:
      montant = 0;
  }

  return Math.round(montant * 100) / 100;
}

/**
 * Vérifie le plafond des pénalités
 * @param {number} cumulPenalites - Cumul des pénalités déjà appliquées
 * @param {number} montantMarche - Montant du marché
 * @param {number} plafondPourcent - Plafond en % du marché (défaut: 10%)
 * @returns {object} { atteint, plafond, restant, pourcentageUtilise }
 */
export function checkPlafond(cumulPenalites, montantMarche, plafondPourcent = 10) {
  const plafondMontant = montantMarche * (plafondPourcent / 100);
  const pourcentageUtilise = (cumulPenalites / plafondMontant) * 100;
  
  return {
    atteint: cumulPenalites >= plafondMontant,
    plafond: Math.round(plafondMontant * 100) / 100,
    restant: Math.max(0, Math.round((plafondMontant - cumulPenalites) * 100) / 100),
    pourcentageUtilise: Math.min(100, Math.round(pourcentageUtilise * 100) / 100)
  };
}

/**
 * Détermine le niveau d'alerte du plafond (sapin de Noël)
 * @param {number} pourcentageUtilise - Pourcentage du plafond utilisé (0-100)
 * @returns {object} { level, color, label }
 */
export function getPlafondAlert(pourcentageUtilise) {
  if (pourcentageUtilise >= 100) {
    return {
      level: 'critical',
      color: '#EF4444', // error
      label: 'PLAFOND ATTEINT — Blocage'
    };
  }
  
  if (pourcentageUtilise >= 95) {
    return {
      level: 'danger',
      color: '#EF4444', // error
      label: 'Plafond critique (95%+)'
    };
  }
  
  if (pourcentageUtilise >= 90) {
    return {
      level: 'warning-high',
      color: '#F59E0B', // warning
      label: 'Plafond élevé (90%+)'
    };
  }
  
  if (pourcentageUtilise >= 80) {
    return {
      level: 'warning',
      color: '#F59E0B', // warning
      label: 'Plafond modéré (80%+)'
    };
  }
  
  return {
    level: 'normal',
    color: '#22C55E', // success
    label: 'Plafond normal'
  };
}

/**
 * Calcule le nombre de jours de retard entre deux dates
 * @param {Date|string} dateDebut - Date de début
 * @param {Date|string} dateFin - Date de fin (ou aujourd'hui)
 * @returns {number} Nombre de jours
 */
export function calculateNbJours(dateDebut, dateFin = null) {
  const debut = new Date(dateDebut);
  const fin = dateFin ? new Date(dateFin) : new Date();
  
  const diffTime = Math.abs(fin - debut);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Vérifie si une pénalité peut être exonérée
 * @param {object} penalite - Pénalité
 * @param {string} motif - Motif d'exonération
 * @param {string} type - Type d'exonération
 * @returns {object} { canExonerate, reason }
 */
export function canExonerate(penalite, motif, type) {
  const validTypes = ['force_majeure', 'retard_moa', 'intemperies', 'prolongation_os', 'autre'];
  
  if (!validTypes.includes(type)) {
    return {
      canExonerate: false,
      reason: 'Type d\'exonération invalide'
    };
  }
  
  if (!motif || motif.trim().length < 10) {
    return {
      canExonerate: false,
      reason: 'Le motif doit contenir au moins 10 caractères'
    };
  }
  
  if (penalite.status === 'exoneree') {
    return {
      canExonerate: false,
      reason: 'Cette pénalité est déjà exonérée'
    };
  }
  
  return {
    canExonerate: true,
    reason: null
  };
}

/**
 * Calcule le montant total des pénalités pour une entreprise/lot
 * @param {array} penalites - Liste des pénalités
 * @param {string} status - Filtre par status (optionnel)
 * @returns {object} { total, count, byType }
 */
export function calculateTotalPenalites(penalites, status = null) {
  let filtered = penalites;
  
  if (status) {
    filtered = penalites.filter(p => p.status === status);
  }
  
  const total = filtered.reduce((sum, p) => sum + (p.montant || 0), 0);
  const count = filtered.length;
  
  // Group by type
  const byType = {};
  filtered.forEach(p => {
    if (!byType[p.type]) {
      byType[p.type] = { count: 0, total: 0 };
    }
    byType[p.type].count++;
    byType[p.type].total += p.montant || 0;
  });
  
  return {
    total: Math.round(total * 100) / 100,
    count,
    byType
  };
}

/**
 * Génère un libellé descriptif pour une pénalité
 * @param {object} bareme - Barème de pénalité
 * @param {number} nbJours - Nombre de jours
 * @returns {string} Libellé
 */
export function generatePenaliteLabel(bareme, nbJours = 0) {
  let label = bareme.libelle;
  
  if (bareme.mode_calcul === 'par_jour' && nbJours > 0) {
    label += ` (${nbJours} jour${nbJours > 1 ? 's' : ''})`;
  } else if (bareme.mode_calcul === 'par_semaine' && nbJours > 0) {
    const nbSemaines = Math.ceil(nbJours / 7);
    label += ` (${nbSemaines} semaine${nbSemaines > 1 ? 's' : ''})`;
  }
  
  return label;
}

/**
 * Valide les paramètres d'un barème de pénalité
 * @param {object} bareme - Barème de pénalité
 * @returns {object} { valid, errors }
 */
export function validateBareme(bareme) {
  const errors = [];
  
  if (!bareme.libelle || bareme.libelle.trim().length < 3) {
    errors.push('Le libellé doit contenir au moins 3 caractères');
  }
  
  if (!bareme.reference_ccap || bareme.reference_ccap.trim().length < 3) {
    errors.push('La référence CCAP doit contenir au moins 3 caractères');
  }
  
  if (!bareme.mode_calcul) {
    errors.push('Le mode de calcul est requis');
  }
  
  if (!bareme.montant_unitaire || bareme.montant_unitaire <= 0) {
    errors.push('Le montant unitaire doit être supérieur à 0');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  calculatePenalite,
  checkPlafond,
  getPlafondAlert,
  calculateNbJours,
  canExonerate,
  calculateTotalPenalites,
  generatePenaliteLabel,
  validateBareme
};
