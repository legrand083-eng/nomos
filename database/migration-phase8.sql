-- ══════════════════════════════════════════════════════════════
-- NOMOΣ — Phase 8 : Sous-traitance + Groupements
-- νόμος — The Standard, The Rule
-- Version: ST-GROUP-V1-0001
-- Date: 13 February 2026
-- ══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- SOUS-TRAITANTS (extends the basic ST from Phase 3)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sous_traitants (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  lot_id INT UNSIGNED NOT NULL,
  entreprise_titulaire_id INT UNSIGNED NOT NULL,
  -- Identity
  name VARCHAR(300) NOT NULL,
  siret VARCHAR(14),
  contact_name VARCHAR(200),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  -- Contract
  montant_ht DECIMAL(15,2) DEFAULT 0.00,
  perimetre TEXT,
  -- Payment mode
  paiement_mode ENUM('direct','indirect') DEFAULT 'direct',
  -- Agrément workflow
  agrement_status ENUM('en_attente','soumis_moe','valide_moe','soumis_moa','agree','refuse') DEFAULT 'en_attente',
  date_soumission DATE,
  date_agrement_moe DATE,
  date_agrement_moa DATE,
  agrement_refus_motif TEXT,
  -- Délai: silence = acceptation (marchés publics, 21j)
  agrement_delai_jours TINYINT UNSIGNED DEFAULT 21,
  agrement_silence_vaut ENUM('acceptation','refus') DEFAULT 'acceptation',
  -- Cumuls
  cumul_paye DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE,
  FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE,
  FOREIGN KEY (entreprise_titulaire_id) REFERENCES entreprises(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DC4 documents for ST agrément
CREATE TABLE IF NOT EXISTS st_documents (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  sous_traitant_id INT UNSIGNED NOT NULL,
  type ENUM('dc4','kbis','urssaf','attestation_fiscale','rc_pro','decennale','contrat_st','rib','references','qualifications') NOT NULL,
  file_path VARCHAR(500),
  sha256_hash VARCHAR(64),
  expires_at DATE,
  status ENUM('pending','validated','rejected','expired') DEFAULT 'pending',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (sous_traitant_id) REFERENCES sous_traitants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ST payment tracking per certificate
CREATE TABLE IF NOT EXISTS st_paiements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  sous_traitant_id INT UNSIGNED NOT NULL,
  certificat_id INT UNSIGNED NOT NULL,
  montant_ht DECIMAL(15,2) DEFAULT 0.00,
  montant_cumul DECIMAL(15,2) DEFAULT 0.00,
  paiement_direct BOOLEAN DEFAULT TRUE,
  attestation_paiement_id INT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (sous_traitant_id) REFERENCES sous_traitants(id) ON DELETE CASCADE,
  FOREIGN KEY (certificat_id) REFERENCES certificats(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════
-- GROUPEMENTS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS groupements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  lot_id INT UNSIGNED NOT NULL,
  type ENUM('solidaire','conjoint') NOT NULL,
  mandataire_id INT UNSIGNED NOT NULL,
  mandataire_solidaire BOOLEAN DEFAULT FALSE,
  -- Certificate config
  certificat_mode ENUM('unique','par_membre') DEFAULT 'unique',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE,
  FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE,
  FOREIGN KEY (mandataire_id) REFERENCES entreprises(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS groupement_membres (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  groupement_id INT UNSIGNED NOT NULL,
  entreprise_id INT UNSIGNED NOT NULL,
  is_mandataire BOOLEAN DEFAULT FALSE,
  part_pourcent DECIMAL(5,2) DEFAULT 0.00,
  montant_part DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (groupement_id) REFERENCES groupements(id) ON DELETE CASCADE,
  FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ══════════════════════════════════════════════════════════════
-- NOMOΣ — © 2026 POLARIS CONSEIL — Groupe QUESTOR
-- ══════════════════════════════════════════════════════════════
