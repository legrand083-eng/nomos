-- ═══════════════════════════════════════════════════════════
-- NOMOΣ Phase 3 — Portail Entreprise tables
-- ═══════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────
-- DOCUMENTS (GED - Gestion Électronique de Documents)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED,
  entreprise_id INT UNSIGNED,
  lot_id INT UNSIGNED,
  type ENUM(
    'kbis','assurance_rc','assurance_decennale','rib',
    'caution','dpgf','acte_engagement','ccap_lot',
    'situation_pdf','facture_pdf','certificat_pdf',
    'courrier','avenant','autre'
  ) NOT NULL,
  name VARCHAR(300) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT UNSIGNED DEFAULT 0,
  mime_type VARCHAR(100) DEFAULT 'application/pdf',
  sha256_hash VARCHAR(64),
  uploaded_by INT UNSIGNED NOT NULL,
  validated_by INT UNSIGNED,
  validated_at TIMESTAMP NULL,
  expires_at DATE,
  status ENUM('pending','validated','rejected','expired') DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE SET NULL,
  FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE SET NULL,
  FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE SET NULL,
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  FOREIGN KEY (validated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────
-- SITUATIONS (Payment claims submitted by companies)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS situations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  lot_id INT UNSIGNED NOT NULL,
  entreprise_id INT UNSIGNED NOT NULL,
  numero SMALLINT UNSIGNED NOT NULL,
  mois_reference DATE NOT NULL,
  -- Amounts
  montant_ht_cumul DECIMAL(15,2) DEFAULT 0.00,
  montant_ht_mois DECIMAL(15,2) DEFAULT 0.00,
  montant_st_ht DECIMAL(15,2) DEFAULT 0.00,
  commentaire TEXT,
  -- Documents
  situation_pdf_id INT UNSIGNED,
  facture_pdf_id INT UNSIGNED,
  -- Workflow status
  status ENUM(
    'brouillon','deposee','controle_opc','controle_moe',
    'certificat_genere','validee_moa','payee','contestee','rejetee'
  ) DEFAULT 'brouillon',
  -- Dates
  date_depot TIMESTAMP NULL,
  date_controle_opc TIMESTAMP NULL,
  date_controle_moe TIMESTAMP NULL,
  date_certificat TIMESTAMP NULL,
  date_validation_moa TIMESTAMP NULL,
  date_paiement TIMESTAMP NULL,
  -- OPC fields
  avancement_physique DECIMAL(5,2) DEFAULT 0.00,
  opc_validated_by INT UNSIGNED,
  opc_comment TEXT,
  -- MOE fields
  montant_valide_ht DECIMAL(15,2) DEFAULT 0.00,
  moe_validated_by INT UNSIGNED,
  moe_comment TEXT,
  -- Modification tracking
  modifiable BOOLEAN DEFAULT TRUE,
  modified_count TINYINT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_situation (operation_id, lot_id, numero),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE,
  FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE,
  FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE,
  FOREIGN KEY (situation_pdf_id) REFERENCES documents(id),
  FOREIGN KEY (facture_pdf_id) REFERENCES documents(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────
-- SITUATION_SOUS_TRAITANTS (ST amounts per situation)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS situation_sous_traitants (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  situation_id INT UNSIGNED NOT NULL,
  sous_traitant_name VARCHAR(300) NOT NULL,
  sous_traitant_siret VARCHAR(14),
  montant_ht DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (situation_id) REFERENCES situations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED,
  type ENUM(
    'situation_deposee','situation_validee','situation_rejetee',
    'certificat_genere','certificat_signe','paiement_effectue',
    'correction_demandee','document_expire','rappel_depot',
    'pedigree_incomplet','alerte_assurance','alerte_caution',
    'contestation','info'
  ) NOT NULL,
  title VARCHAR(300) NOT NULL,
  message TEXT,
  link VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  is_popup BOOLEAN DEFAULT FALSE,
  priority ENUM('low','normal','high','urgent') DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────
-- CONTESTATIONS
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contestations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  situation_id INT UNSIGNED NOT NULL,
  entreprise_id INT UNSIGNED NOT NULL,
  motif TEXT NOT NULL,
  montant_conteste DECIMAL(15,2),
  status ENUM('ouverte','en_cours','resolue','rejetee') DEFAULT 'ouverte',
  reponse TEXT,
  reponse_by INT UNSIGNED,
  reponse_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (situation_id) REFERENCES situations(id) ON DELETE CASCADE,
  FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
