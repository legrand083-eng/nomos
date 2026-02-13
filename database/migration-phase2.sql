-- ═══════════════════════════════════════════════════════════
-- NOMOΣ Phase 2 — Pedigree Opération tables
-- ═══════════════════════════════════════════════════════════

-- Extend operations table with Pedigree A + B fields
ALTER TABLE operations
  ADD COLUMN operation_type ENUM('public','private') DEFAULT 'public' AFTER name,
  ADD COLUMN market_type ENUM('travaux','moe','mixte') DEFAULT 'travaux' AFTER operation_type,
  ADD COLUMN market_form ENUM('ordinaire','befa','cpi','vefa','conception_realisation','ppp','concession') DEFAULT 'ordinaire' AFTER market_type,
  ADD COLUMN department VARCHAR(5) AFTER postal_code,
  ADD COLUMN region VARCHAR(100) AFTER department,
  ADD COLUMN budget_ht DECIMAL(15,2) DEFAULT 0.00 AFTER total_ht,
  ADD COLUMN budget_ttc DECIMAL(15,2) DEFAULT 0.00 AFTER budget_ht,
  ADD COLUMN nb_lots TINYINT UNSIGNED DEFAULT 0 AFTER budget_ttc,
  ADD COLUMN description TEXT AFTER name,
  -- Section B: Juridique
  ADD COLUMN referentiel ENUM('ccag_2021','ccag_2009','nf_p03_001','autre') DEFAULT 'ccag_2021' AFTER nb_lots,
  ADD COLUMN ccap_uploaded BOOLEAN DEFAULT FALSE AFTER referentiel,
  ADD COLUMN ccap_file_path VARCHAR(500) AFTER ccap_uploaded,
  ADD COLUMN derogations_ccag TEXT AFTER ccap_file_path,
  ADD COLUMN has_derogations BOOLEAN DEFAULT FALSE AFTER derogations_ccag,
  -- Section D: Planning
  ADD COLUMN date_os1 DATE AFTER end_date,
  ADD COLUMN date_os2 DATE AFTER date_os1,
  ADD COLUMN duree_globale_mois TINYINT UNSIGNED DEFAULT 0 AFTER date_os2,
  ADD COLUMN duree_preparation_jours SMALLINT UNSIGNED DEFAULT 0 AFTER duree_globale_mois,
  ADD COLUMN date_fin_prevue DATE AFTER duree_preparation_jours,
  ADD COLUMN conges_annuels_debut DATE AFTER date_fin_prevue,
  ADD COLUMN conges_annuels_fin DATE AFTER conges_annuels_debut,
  ADD COLUMN intemperies_jours_prevus SMALLINT UNSIGNED DEFAULT 0 AFTER conges_annuels_fin,
  ADD COLUMN jour_reunion_chantier ENUM('lundi','mardi','mercredi','jeudi','vendredi') DEFAULT 'mardi' AFTER intemperies_jours_prevus,
  ADD COLUMN frequence_reunion ENUM('hebdomadaire','bimensuelle','mensuelle') DEFAULT 'hebdomadaire' AFTER jour_reunion_chantier,
  ADD COLUMN date_limite_situation TINYINT UNSIGNED DEFAULT 25 AFTER frequence_reunion,
  -- Section E: Financier
  ADD COLUMN rg_rate DECIMAL(5,2) DEFAULT 5.00 AFTER retention_rate,
  ADD COLUMN rg_mode ENUM('retenue','caution','garantie_premiere_demande') DEFAULT 'retenue' AFTER rg_rate,
  ADD COLUMN avance_forfaitaire BOOLEAN DEFAULT TRUE AFTER rg_mode,
  ADD COLUMN avance_forfaitaire_rate DECIMAL(5,2) DEFAULT 5.00 AFTER avance_forfaitaire,
  ADD COLUMN avance_forfaitaire_base ENUM('ht','ttc') DEFAULT 'ttc' AFTER avance_forfaitaire_rate,
  ADD COLUMN avance_remb_debut DECIMAL(5,2) DEFAULT 65.00 AFTER avance_forfaitaire_base,
  ADD COLUMN avance_remb_fin DECIMAL(5,2) DEFAULT 80.00 AFTER avance_remb_debut,
  ADD COLUMN avance_appro BOOLEAN DEFAULT FALSE AFTER avance_remb_fin,
  ADD COLUMN avance_appro_rate DECIMAL(5,2) DEFAULT 50.00 AFTER avance_appro,
  ADD COLUMN prorata_mode ENUM('forfaitaire','reel','sans') DEFAULT 'forfaitaire' AFTER avance_appro_rate,
  ADD COLUMN prorata_rate DECIMAL(5,2) DEFAULT 1.50 AFTER prorata_mode,
  ADD COLUMN prorata_gestionnaire VARCHAR(200) AFTER prorata_rate,
  ADD COLUMN revision_prix BOOLEAN DEFAULT TRUE AFTER prorata_gestionnaire,
  ADD COLUMN revision_type ENUM('ferme','revisable','actualisable') DEFAULT 'revisable' AFTER revision_prix,
  ADD COLUMN penalite_retard_mode ENUM('par_jour','par_semaine','forfait') DEFAULT 'par_jour' AFTER penalty_rate_bce_plus,
  ADD COLUMN penalite_retard_montant DECIMAL(10,2) DEFAULT 0.00 AFTER penalite_retard_mode,
  ADD COLUMN penalite_plafond_rate DECIMAL(5,2) DEFAULT 10.00 AFTER penalite_retard_montant,
  ADD COLUMN penalite_absence_reunion DECIMAL(8,2) DEFAULT 150.00 AFTER penalite_plafond_rate,
  ADD COLUMN insertion_sociale BOOLEAN DEFAULT FALSE AFTER penalite_absence_reunion,
  ADD COLUMN insertion_heures_prevues INT UNSIGNED DEFAULT 0 AFTER insertion_sociale,
  ADD COLUMN pedigree_completion TINYINT UNSIGNED DEFAULT 0 AFTER insertion_heures_prevues;

-- ───────────────────────────────────────────────────────────
-- INTERVENANTS (Section C)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS intervenants (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  type ENUM('moa','moa_delegue','moe','opc','architecte','bet_structure','bet_fluides','bet_ssi','bet_vrd','bet_espaces_verts','csps','controleur_technique','autre') NOT NULL,
  is_mandataire BOOLEAN DEFAULT FALSE,
  name VARCHAR(300) NOT NULL,
  siret VARCHAR(14),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  -- Multi-contacts
  contact_direction_name VARCHAR(200),
  contact_direction_email VARCHAR(255),
  contact_direction_phone VARCHAR(20),
  contact_technique_name VARCHAR(200),
  contact_technique_email VARCHAR(255),
  contact_technique_phone VARCHAR(20),
  contact_compta_name VARCHAR(200),
  contact_compta_email VARCHAR(255),
  contact_compta_phone VARCHAR(20),
  -- Rôle dans les certificats
  signe_certificats BOOLEAN DEFAULT FALSE,
  perimetre_lots TEXT,
  sort_order TINYINT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────
-- JALONS (Section D - Planning milestones)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jalons (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  lot_id INT UNSIGNED,
  name VARCHAR(300) NOT NULL,
  date_prevue DATE NOT NULL,
  date_reelle DATE,
  type ENUM('demarrage','jalon_intermediaire','reception_partielle','reception_definitive','dgd') NOT NULL,
  penalite_applicable BOOLEAN DEFAULT TRUE,
  status ENUM('a_venir','en_cours','atteint','depasse') DEFAULT 'a_venir',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE,
  FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────
-- LOTS: Add Pedigree F fields
-- ───────────────────────────────────────────────────────────
ALTER TABLE lots
  ADD COLUMN description TEXT AFTER name,
  ADD COLUMN duree_mois TINYINT UNSIGNED DEFAULT 0 AFTER description,
  ADD COLUMN date_debut DATE AFTER duree_mois,
  ADD COLUMN date_fin DATE AFTER date_debut,
  ADD COLUMN revision_indice_reference VARCHAR(20) AFTER indice_type,
  ADD COLUMN revision_mois_reference DATE AFTER revision_indice_reference,
  ADD COLUMN revision_partie_fixe DECIMAL(4,2) DEFAULT 0.15 AFTER revision_mois_reference,
  ADD COLUMN revision_partie_variable DECIMAL(4,2) DEFAULT 0.85 AFTER revision_partie_fixe,
  ADD COLUMN intervenant_moe_id INT UNSIGNED AFTER revision_partie_variable,
  ADD COLUMN has_sous_traitants BOOLEAN DEFAULT FALSE AFTER intervenant_moe_id;

-- ───────────────────────────────────────────────────────────
-- ENTREPRISES: Add Pedigree F fields  
-- ───────────────────────────────────────────────────────────
ALTER TABLE entreprises
  ADD COLUMN assurance_rc_numero VARCHAR(50) AFTER assurance_rc_expire,
  ADD COLUMN assurance_rc_assureur VARCHAR(200) AFTER assurance_rc_numero,
  ADD COLUMN assurance_rc_montant DECIMAL(15,2) AFTER assurance_rc_assureur,
  ADD COLUMN assurance_decennale_numero VARCHAR(50) AFTER assurance_decennale_expire,
  ADD COLUMN assurance_decennale_assureur VARCHAR(200) AFTER assurance_decennale_numero,
  ADD COLUMN assurance_decennale_activites TEXT AFTER assurance_decennale_assureur,
  ADD COLUMN caution_type ENUM('retenue','caution_bancaire','garantie_premiere_demande') DEFAULT 'retenue' AFTER assurance_decennale_activites,
  ADD COLUMN caution_organisme VARCHAR(200) AFTER caution_type,
  ADD COLUMN caution_montant DECIMAL(15,2) AFTER caution_organisme,
  ADD COLUMN caution_date_fin DATE AFTER caution_montant,
  ADD COLUMN urssaf_date DATE AFTER kbis_date,
  ADD COLUMN urssaf_conforme BOOLEAN DEFAULT FALSE AFTER urssaf_date,
  ADD COLUMN fiscal_date DATE AFTER urssaf_conforme,
  ADD COLUMN fiscal_conforme BOOLEAN DEFAULT FALSE AFTER fiscal_date,
  ADD COLUMN code_maitre VARCHAR(20) AFTER fiscal_conforme;
