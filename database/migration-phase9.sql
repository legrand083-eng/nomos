-- ══════════════════════════════════════════════════════════════
-- NOMOΣ — Phase 9 : Compte Prorata + Réception/Clôture/DGD
-- νόμος — The Standard, The Rule
-- Date: 2026-02-13
-- ══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- COMPTE PRORATA
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS compte_prorata (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  -- Config
  gestionnaire_lot_id INT UNSIGNED,
  mode_repartition ENUM('prorata_marche','parts_egales','personnalise') DEFAULT 'prorata_marche',
  taux_prelevement DECIMAL(5,2) DEFAULT 0.00,
  -- Totals
  total_recettes DECIMAL(15,2) DEFAULT 0.00,
  total_depenses DECIMAL(15,2) DEFAULT 0.00,
  solde DECIMAL(15,2) DEFAULT 0.00,
  status ENUM('ouvert','en_cloture','cloture') DEFAULT 'ouvert',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prorata_depenses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  compte_prorata_id INT UNSIGNED NOT NULL,
  date_depense DATE NOT NULL,
  designation VARCHAR(500) NOT NULL,
  categorie ENUM('gardiennage','nettoyage','reparation_identifie','reparation_non_identifie','eau_electricite','vol','divers') NOT NULL,
  montant_ht DECIMAL(10,2) NOT NULL,
  justificatif_path VARCHAR(500),
  -- If identified damage → specific company
  entreprise_fautive_id INT UNSIGNED,
  -- Arbitrage if contested
  is_contested BOOLEAN DEFAULT FALSE,
  arbitrage_status ENUM('none','en_cours','resolue') DEFAULT 'none',
  arbitrage_decision TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (compte_prorata_id) REFERENCES compte_prorata(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prorata_repartitions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  compte_prorata_id INT UNSIGNED NOT NULL,
  entreprise_id INT UNSIGNED NOT NULL,
  lot_id INT UNSIGNED NOT NULL,
  part_pourcent DECIMAL(5,2) DEFAULT 0.00,
  montant_du DECIMAL(15,2) DEFAULT 0.00,
  montant_verse DECIMAL(15,2) DEFAULT 0.00,
  solde DECIMAL(15,2) DEFAULT 0.00,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (compte_prorata_id) REFERENCES compte_prorata(id) ON DELETE CASCADE,
  FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════
-- RÉCEPTION / CLÔTURE / DGD
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS receptions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  lot_id INT UNSIGNED NOT NULL,
  entreprise_id INT UNSIGNED NOT NULL,
  -- Type
  type ENUM('partielle','totale') DEFAULT 'totale',
  perimetre TEXT,
  -- Key dates (entered manually — PV is external)
  date_reception DATE NOT NULL,
  has_reserves BOOLEAN DEFAULT FALSE,
  date_levee_reserves DATE,
  -- Calculated dates
  date_fin_garantie_parfait DATE,
  date_liberation_rg DATE,
  date_fin_decennale DATE,
  -- Retenues notification
  delai_notification_retenues TINYINT UNSIGNED DEFAULT 30,
  date_limite_retenues DATE,
  retenues_notifiees BOOLEAN DEFAULT FALSE,
  -- Status
  status ENUM('enregistree','reserves_levees','rg_liberee','dgd_etabli','cloture') DEFAULT 'enregistree',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE,
  FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE,
  FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dgd (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  lot_id INT UNSIGNED NOT NULL,
  entreprise_id INT UNSIGNED NOT NULL,
  reception_id INT UNSIGNED NOT NULL,
  -- Amounts
  total_travaux_ht DECIMAL(15,2) DEFAULT 0.00,
  total_revision DECIMAL(15,2) DEFAULT 0.00,
  total_penalites DECIMAL(15,2) DEFAULT 0.00,
  retenue_garantie DECIMAL(15,2) DEFAULT 0.00,
  rg_liberee BOOLEAN DEFAULT FALSE,
  total_avances_remboursees DECIMAL(15,2) DEFAULT 0.00,
  solde_prorata DECIMAL(15,2) DEFAULT 0.00,
  execution_aux_frais DECIMAL(15,2) DEFAULT 0.00,
  solde_net_dgd DECIMAL(15,2) DEFAULT 0.00,
  -- Workflow
  status ENUM('brouillon','genere','signe_entreprise','signe_moe','signe_moa','definitif') DEFAULT 'brouillon',
  date_generation TIMESTAMP NULL,
  date_signature_entreprise TIMESTAMP NULL,
  date_signature_moe TIMESTAMP NULL,
  date_signature_moa TIMESTAMP NULL,
  -- Silence = acceptance
  delai_reponse_entreprise TINYINT UNSIGNED DEFAULT 30,
  date_limite_reponse DATE,
  reponse_entreprise ENUM('accepte','reserves','silence') DEFAULT 'silence',
  reserves_entreprise TEXT,
  -- PDF
  pdf_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE,
  FOREIGN KEY (reception_id) REFERENCES receptions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ══════════════════════════════════════════════════════════════
-- END OF MIGRATION PHASE 9
-- ══════════════════════════════════════════════════════════════
