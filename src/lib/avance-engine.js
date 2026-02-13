/**
 * NOMOΣ — Avance Engine
 * Moteur de calcul des avances forfaitaires et remboursements progressifs
 * Conforme CCAG 2021
 */

/**
 * Calcule le montant de l'avance forfaitaire
 * @param {number} montantMarche - Montant du marché
 * @param {number} taux - Taux de l'avance (%)
 * @param {string} baseCalcul - Base de calcul ('ht' ou 'ttc')
 * @returns {number} Montant de l'avance
 */
export function calculateAvanceForfaitaire(montantMarche, taux, baseCalcul = 'ttc') {
  if (!montantMarche || montantMarche <= 0) return 0;
  if (!taux || taux <= 0) return 0;
  
  const montantAvance = montantMarche * (taux / 100);
  return Math.round(montantAvance * 100) / 100;
}

/**
 * Calcule le remboursement mensuel de l'avance selon l'avancement
 * Remboursement progressif entre seuil_debut_remb et seuil_fin_remb
 * 
 * Exemple: avance 87 000€, seuils 65-80%
 *   At 65%: ratio=0, remb=0
 *   At 70%: ratio=0.333, totalDu=29000, remb=29000
 *   At 75%: ratio=0.667, totalDu=58000, remb=29000
 *   At 80%: ratio=1.0, totalDu=87000, remb=29000 (soldé)
 * 
 * @param {object} avance - Objet avance
 * @param {number} avancementPourcent - Avancement actuel (%)
 * @returns {object} { montantRembourse, cumulApres, soldeApres, estSoldee }
 */
export function calculateRemboursement(avance, avancementPourcent) {
  const {
    montant_avance,
    cumul_rembourse = 0,
    seuil_debut_remb = 65,
    seuil_fin_remb = 80
  } = avance;

  // Avant le seuil de début: pas de remboursement
  if (avancementPourcent < seuil_debut_remb) {
    return {
      montantRembourse: 0,
      cumulApres: cumul_rembourse,
      soldeApres: montant_avance - cumul_rembourse,
      estSoldee: false
    };
  }

  // Après le seuil de fin: solder l'avance
  if (avancementPourcent >= seuil_fin_remb) {
    const montantRembourse = montant_avance - cumul_rembourse;
    return {
      montantRembourse: Math.max(0, montantRembourse),
      cumulApres: montant_avance,
      soldeApres: 0,
      estSoldee: true
    };
  }

  // Entre les deux seuils: remboursement progressif
  const ratio = (avancementPourcent - seuil_debut_remb) / (seuil_fin_remb - seuil_debut_remb);
  const totalDu = montant_avance * ratio;
  const montantRembourse = totalDu - cumul_rembourse;
  const cumulApres = cumul_rembourse + montantRembourse;
  const soldeApres = montant_avance - cumulApres;

  return {
    montantRembourse: Math.max(0, Math.round(montantRembourse * 100) / 100),
    cumulApres: Math.round(cumulApres * 100) / 100,
    soldeApres: Math.round(soldeApres * 100) / 100,
    estSoldee: soldeApres <= 0.01
  };
}

/**
 * Calcule le statut de l'avance selon l'avancement
 * @param {object} avance - Objet avance
 * @param {number} avancementPourcent - Avancement actuel (%)
 * @returns {string} Status de l'avance
 */
export function getAvanceStatus(avance, avancementPourcent) {
  if (!avance.date_versement) {
    return 'non_demandee';
  }

  if (avancementPourcent < avance.seuil_debut_remb) {
    return 'versee';
  }

  if (avancementPourcent >= avance.seuil_fin_remb || avance.solde_restant <= 0.01) {
    return 'soldee';
  }

  return 'en_remboursement';
}

/**
 * Calcule la progression du remboursement (%)
 * @param {object} avance - Objet avance
 * @returns {number} Pourcentage de remboursement (0-100)
 */
export function getRemboursementProgress(avance) {
  if (!avance.montant_avance || avance.montant_avance === 0) return 0;
  
  const progress = (avance.cumul_rembourse / avance.montant_avance) * 100;
  return Math.min(100, Math.max(0, Math.round(progress * 100) / 100));
}

/**
 * Valide les paramètres d'une avance forfaitaire
 * @param {object} params - Paramètres de l'avance
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateAvanceParams(params) {
  const errors = [];

  if (!params.taux || params.taux <= 0 || params.taux > 100) {
    errors.push('Le taux doit être entre 0 et 100%');
  }

  if (!params.montant_marche || params.montant_marche <= 0) {
    errors.push('Le montant du marché doit être supérieur à 0');
  }

  if (params.seuil_debut_remb < 0 || params.seuil_debut_remb > 100) {
    errors.push('Le seuil de début de remboursement doit être entre 0 et 100%');
  }

  if (params.seuil_fin_remb < 0 || params.seuil_fin_remb > 100) {
    errors.push('Le seuil de fin de remboursement doit être entre 0 et 100%');
  }

  if (params.seuil_fin_remb <= params.seuil_debut_remb) {
    errors.push('Le seuil de fin doit être supérieur au seuil de début');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Génère un historique de simulation de remboursement
 * @param {object} avance - Objet avance
 * @param {number} avancementActuel - Avancement actuel (%)
 * @returns {array} Historique de simulation
 */
export function simulateRemboursementHistory(avance, avancementActuel) {
  const history = [];
  const steps = [0, 50, 60, 65, 70, 75, 80, 85, 90, 95, 100];
  
  let cumulRembourse = 0;

  for (const avancement of steps) {
    if (avancement > avancementActuel) break;

    const tempAvance = { ...avance, cumul_rembourse: cumulRembourse };
    const result = calculateRemboursement(tempAvance, avancement);

    history.push({
      avancement,
      montantRembourse: result.montantRembourse,
      cumulApres: result.cumulApres,
      soldeApres: result.soldeApres,
      estSoldee: result.estSoldee
    });

    cumulRembourse = result.cumulApres;
  }

  return history;
}

export default {
  calculateAvanceForfaitaire,
  calculateRemboursement,
  getAvanceStatus,
  getRemboursementProgress,
  validateAvanceParams,
  simulateRemboursementHistory
};
