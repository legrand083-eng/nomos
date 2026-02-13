-- ═══════════════════════════════════════════════════════════
-- NOMOΣ — Phase 7: AVANCES + PÉNALITÉS
-- Migration SQL
-- Date: 13 février 2026
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- AVANCES
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS avances (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  lot_id INT UNSIGNED NOT NULL,
  entreprise_id INT UNSIGNED NOT NULL,
  type ENUM('forfaitaire','approvisionnements') NOT NULL,
  -- Forfaitaire params
  taux DECIMAL(5,2) DEFAULT 5.00,
  base_calcul ENUM('ht','ttc') DEFAULT 'ttc',
  montant_marche DECIMAL(15,2) DEFAULT 0.00,
  montant_avance DECIMAL(15,2) DEFAULT 0.00,
  -- Guarantee
  garantie_requise BOOLEAN DEFAULT FALSE,
  garantie_document_id INT UNSIGNED,
  -- Payment
  date_versement DATE,
  status ENUM('non_demandee','demandee','versee','en_remboursement','soldee','renoncee') DEFAULT 'non_demandee',
  -- Remboursement thresholds
  seuil_debut_remb DECIMAL(5,2) DEFAULT 65.00,
  seuil_fin_remb DECIMAL(5,2) DEFAULT 80.00,
  -- Tracking
  cumul_rembourse DECIMAL(15,2) DEFAULT 0.00,
  solde_restant DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE,
  FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE,
  FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Monthly avance remboursement per certificate
CREATE TABLE IF NOT EXISTS avance_remboursements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  avance_id INT UNSIGNED NOT NULL,
  certificat_id INT UNSIGNED NOT NULL,
  mois DATE NOT NULL,
  avancement_pourcent DECIMAL(5,2) DEFAULT 0.00,
  montant_rembourse DECIMAL(15,2) DEFAULT 0.00,
  cumul_apres DECIMAL(15,2) DEFAULT 0.00,
  solde_apres DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (avance_id) REFERENCES avances(id) ON DELETE CASCADE,
  FOREIGN KEY (certificat_id) REFERENCES certificats(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Approvisionnements (for avance appro)
CREATE TABLE IF NOT EXISTS approvisionnements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  avance_id INT UNSIGNED NOT NULL,
  designation VARCHAR(500) NOT NULL,
  valeur_ht DECIMAL(15,2) DEFAULT 0.00,
  avance_versee DECIMAL(15,2) DEFAULT 0.00,
  date_livraison DATE,
  date_mise_en_oeuvre DATE,
  status ENUM('commande','livre','mis_en_oeuvre','rembourse') DEFAULT 'commande',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (avance_id) REFERENCES avances(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════
-- PÉNALITÉS — Extended barème
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS penalite_baremes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  type ENUM('retard_global','retard_jalon','absence_reunion','defaut_nettoyage','non_port_epi','retard_situation','non_conformite','autre') NOT NULL,
  libelle VARCHAR(300) NOT NULL,
  reference_ccap VARCHAR(100) NOT NULL,
  mode_calcul ENUM('par_jour','par_semaine','forfait','pourcentage') NOT NULL,
  montant_unitaire DECIMAL(10,2) DEFAULT 0.00,
  base_pourcentage ENUM('marche_ht','situation_ht','forfait') DEFAULT 'forfait',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Extend penalites table with exoneration support
ALTER TABLE penalites
  ADD COLUMN bareme_id INT UNSIGNED AFTER entreprise_id,
  ADD COLUMN nb_jours SMALLINT UNSIGNED DEFAULT 0 AFTER montant,
  ADD COLUMN date_debut DATE AFTER nb_jours,
  ADD COLUMN date_fin DATE AFTER date_debut,
  ADD COLUMN plafond_atteint BOOLEAN DEFAULT FALSE AFTER date_fin,
  ADD COLUMN exoneration_motif TEXT AFTER plafond_atteint,
  ADD COLUMN exoneration_type ENUM('force_majeure','retard_moa','intemperies','prolongation_os','autre') AFTER exoneration_motif;

-- Plafonds per operation
ALTER TABLE operations
  ADD COLUMN penalite_plafond_pourcent DECIMAL(5,2) DEFAULT 10.00 AFTER moa_auto_payment_delay,
  ADD COLUMN penalite_plafond_referentiel ENUM('ccag_2021','nf_p03_001','ccap') DEFAULT 'ccag_2021' AFTER penalite_plafond_pourcent;

-- ═══════════════════════════════════════════════════════════
-- END MIGRATION PHASE 7
-- ═══════════════════════════════════════════════════════════
