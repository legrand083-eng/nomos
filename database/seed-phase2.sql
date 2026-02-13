-- ═══════════════════════════════════════════════════════════
-- NOMOΣ Phase 2 — Seed data for TOTEM operation
-- ═══════════════════════════════════════════════════════════

-- Update TOTEM operation with full pedigree
UPDATE operations SET
  operation_type = 'public',
  market_type = 'travaux',
  market_form = 'ordinaire',
  description = '31 logements locatifs sociaux — Résidence Les Vespins',
  department = '06',
  region = 'Provence-Alpes-Côte d''Azur',
  budget_ht = 4850000.00,
  budget_ttc = 5820000.00,
  nb_lots = 5,
  referentiel = 'ccag_2021',
  ccap_uploaded = FALSE,
  has_derogations = TRUE,
  derogations_ccag = 'Art. 14.1 — Délai de paiement porté à 45 jours\nArt. 20.1 — Avance forfaitaire portée à 10%\nArt. 41.3 — Pénalités plafonnées à 5%',
  date_os1 = '2025-03-15',
  duree_globale_mois = 24,
  duree_preparation_jours = 30,
  date_fin_prevue = '2027-03-15',
  conges_annuels_debut = '2025-08-01',
  conges_annuels_fin = '2025-08-22',
  intemperies_jours_prevus = 25,
  jour_reunion_chantier = 'mardi',
  frequence_reunion = 'hebdomadaire',
  date_limite_situation = 25,
  rg_rate = 5.00,
  rg_mode = 'retenue',
  avance_forfaitaire = TRUE,
  avance_forfaitaire_rate = 10.00,
  avance_forfaitaire_base = 'ttc',
  avance_remb_debut = 65.00,
  avance_remb_fin = 80.00,
  avance_appro = FALSE,
  prorata_mode = 'forfaitaire',
  prorata_rate = 1.50,
  prorata_gestionnaire = 'Azur BTP Group (lot 03)',
  revision_prix = TRUE,
  revision_type = 'revisable',
  penalite_retard_mode = 'par_jour',
  penalite_retard_montant = 1616.67,
  penalite_plafond_rate = 5.00,
  penalite_absence_reunion = 200.00,
  insertion_sociale = TRUE,
  insertion_heures_prevues = 2400,
  pedigree_completion = 85
WHERE code = 'P388L';

-- Intervenants TOTEM
INSERT INTO intervenants (tenant_id, operation_id, type, is_mandataire, name, siret, contact_direction_name, contact_direction_email, contact_technique_name, contact_technique_email, signe_certificats, sort_order) VALUES
(1, 1, 'moa', FALSE, '3F SUD', '30612345600028', 'Bernard MARTINEZ', 'b.martinez@3fsud.fr', 'Isabelle FOURNIER', 'i.fournier@3fsud.fr', FALSE, 1),
(1, 1, 'moe', TRUE, 'POLARIS CONSEIL', '82345678901234', 'Christophe DURAND', 'christophe@polarisconseil.pro', 'Christophe DURAND', 'christophe@polarisconseil.pro', TRUE, 2),
(1, 1, 'architecte', FALSE, 'Atelier RIVIERA Architecture', '44567890123456', 'Paul GIRARD', 'p.girard@riviera-archi.fr', 'Paul GIRARD', 'p.girard@riviera-archi.fr', FALSE, 3),
(1, 1, 'bet_structure', FALSE, 'BET STRUCTURES AZUR', '55678901234567', 'Marc LEROY', 'm.leroy@bet-azur.fr', 'Marc LEROY', 'm.leroy@bet-azur.fr', TRUE, 4),
(1, 1, 'opc', FALSE, 'OPC COORDINATION SUD', '66789012345678', 'Jean DUBOIS', 'j.dubois@opc-sud.fr', 'Jean DUBOIS', 'j.dubois@opc-sud.fr', FALSE, 5);

-- Jalons TOTEM
INSERT INTO jalons (tenant_id, operation_id, name, date_prevue, type, penalite_applicable, status) VALUES
(1, 1, 'Démarrage travaux', '2025-04-15', 'demarrage', FALSE, 'atteint'),
(1, 1, 'Fin terrassements', '2025-09-30', 'jalon_intermediaire', TRUE, 'en_cours'),
(1, 1, 'Clos couvert', '2026-06-30', 'jalon_intermediaire', TRUE, 'a_venir'),
(1, 1, 'Réception', '2027-03-15', 'reception_definitive', TRUE, 'a_venir');

-- Update lots with Phase 2 fields
UPDATE lots SET
  description = 'Terrassements généraux et voiries',
  duree_mois = 6,
  revision_indice_reference = 'TP01',
  revision_mois_reference = '2025-03-01',
  revision_partie_fixe = 0.15,
  revision_partie_variable = 0.85,
  intervenant_moe_id = 2
WHERE number = '01' AND operation_id = 1;

UPDATE lots SET
  description = 'Soutènement et fondations spéciales',
  duree_mois = 8,
  revision_indice_reference = 'BT01',
  revision_mois_reference = '2025-03-01',
  revision_partie_fixe = 0.15,
  revision_partie_variable = 0.85,
  intervenant_moe_id = 4
WHERE number = '02' AND operation_id = 1;

UPDATE lots SET
  description = 'Gros œuvre — Structure béton',
  duree_mois = 18,
  revision_indice_reference = 'BT01',
  revision_mois_reference = '2025-03-01',
  revision_partie_fixe = 0.15,
  revision_partie_variable = 0.85,
  intervenant_moe_id = 4
WHERE number = '03' AND operation_id = 1;

UPDATE lots SET
  description = 'Plomberie, chauffage, ventilation, climatisation',
  duree_mois = 14,
  revision_indice_reference = 'BT40',
  revision_mois_reference = '2025-03-01',
  revision_partie_fixe = 0.15,
  revision_partie_variable = 0.85,
  intervenant_moe_id = 2
WHERE number = '04' AND operation_id = 1;

UPDATE lots SET
  description = 'Courants forts et courants faibles',
  duree_mois = 14,
  revision_indice_reference = 'BT46',
  revision_mois_reference = '2025-03-01',
  revision_partie_fixe = 0.15,
  revision_partie_variable = 0.85,
  intervenant_moe_id = 2
WHERE number = '05' AND operation_id = 1;
