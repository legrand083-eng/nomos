-- ═══════════════════════════════════════════════════════════
-- NOMOΣ Phase 4 — Workflow Principal tables
-- ═══════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────
-- CERTIFICATS (Payment Certificates)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificats (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  lot_id INT UNSIGNED NOT NULL,
  entreprise_id INT UNSIGNED NOT NULL,
  situation_id INT UNSIGNED NOT NULL,
  numero VARCHAR(20) NOT NULL,
  mois_reference DATE NOT NULL,
  -- Configuration
  config_type ENUM('simple','avec_st','groupement','groupement_st') DEFAULT 'simple',
  -- Zone 1: Identification
  moe_name VARCHAR(300),
  moe_siret VARCHAR(14),
  moa_name VARCHAR(300),
  entreprise_name VARCHAR(300),
  lot_numero VARCHAR(10),
  lot_name VARCHAR(300),
  -- Zone 2: Comptable
  montant_marche_initial DECIMAL(15,2) DEFAULT 0.00,
  montant_avenants DECIMAL(15,2) DEFAULT 0.00,
  montant_marche_total DECIMAL(15,2) DEFAULT 0.00,
  montant_cumul_precedent DECIMAL(15,2) DEFAULT 0.00,
  montant_cumul_actuel DECIMAL(15,2) DEFAULT 0.00,
  montant_mois_ht DECIMAL(15,2) DEFAULT 0.00,
  -- Déductions
  retenue_garantie_rate DECIMAL(5,2) DEFAULT 5.00,
  retenue_garantie_montant DECIMAL(15,2) DEFAULT 0.00,
  penalites_montant DECIMAL(15,2) DEFAULT 0.00,
  penalites_detail TEXT,
  prorata_montant DECIMAL(15,2) DEFAULT 0.00,
  avance_remboursement DECIMAL(15,2) DEFAULT 0.00,
  -- Révision de prix
  revision_applicable BOOLEAN DEFAULT FALSE,
  revision_indice_base VARCHAR(20),
  revision_indice_actuel VARCHAR(20),
  revision_coefficient DECIMAL(8,6) DEFAULT 1.000000,
  revision_montant DECIMAL(15,2) DEFAULT 0.00,
  -- TVA
  tva_rate DECIMAL(5,2) DEFAULT 20.00,
  tva_autoliquidation BOOLEAN DEFAULT FALSE,
  montant_ht DECIMAL(15,2) DEFAULT 0.00,
  montant_tva DECIMAL(15,2) DEFAULT 0.00,
  montant_ttc DECIMAL(15,2) DEFAULT 0.00,
  -- Retenue de garantie (AFTER TVA - French law)
  rg_after_tva DECIMAL(15,2) DEFAULT 0.00,
  -- Net à payer
  net_a_payer DECIMAL(15,2) DEFAULT 0.00,
  -- Zone 3: Sous-traitants
  has_sous_traitants BOOLEAN DEFAULT FALSE,
  -- Zone 4: Signatures
  status ENUM(
    'brouillon','genere','signe_moe','signe_entreprise',
    'transmis_moa','valide_moa','paye','annule'
  ) DEFAULT 'brouillon',
  is_provisoire BOOLEAN DEFAULT TRUE,
  -- Signature dates
  date_generation TIMESTAMP NULL,
  date_signature_moe TIMESTAMP NULL,
  date_signature_entreprise TIMESTAMP NULL,
  date_transmission_moa TIMESTAMP NULL,
  date_validation_moa TIMESTAMP NULL,
  date_paiement TIMESTAMP NULL,
  -- Signature codes (Code MAÎTRE)
  code_signature_moe VARCHAR(100),
  code_signature_entreprise VARCHAR(100),
  code_validation_moa VARCHAR(100),
  -- PDF paths
  pdf_provisoire_path VARCHAR(500),
  pdf_definitif_path VARCHAR(500),
  -- Cession Dailly
  has_cession_dailly BOOLEAN DEFAULT FALSE,
  dailly_beneficiaire VARCHAR(300),
  dailly_montant DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE,
  FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE,
  FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE,
  FOREIGN KEY (situation_id) REFERENCES situations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────
-- CERTIFICAT_SOUS_TRAITANTS (ST section of certificate)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificat_sous_traitants (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  certificat_id INT UNSIGNED NOT NULL,
  sous_traitant_name VARCHAR(300) NOT NULL,
  sous_traitant_siret VARCHAR(14),
  montant_ht DECIMAL(15,2) DEFAULT 0.00,
  montant_cumul DECIMAL(15,2) DEFAULT 0.00,
  paiement_direct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (certificat_id) REFERENCES certificats(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────
-- PENALITES (Penalties proposed by OPC, decided by MOA)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS penalites (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  lot_id INT UNSIGNED NOT NULL,
  entreprise_id INT UNSIGNED NOT NULL,
  situation_id INT UNSIGNED,
  type ENUM('retard_depot','retard_execution','absence_reunion','non_conformite','autre') NOT NULL,
  motif TEXT NOT NULL,
  reference_ccap VARCHAR(100),
  montant DECIMAL(10,2) DEFAULT 0.00,
  mode ENUM('definitive','provisoire') DEFAULT 'provisoire',
  -- Workflow: OPC proposes, MOA decides
  proposed_by INT UNSIGNED NOT NULL,
  proposed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('proposee','validee_moa','refusee_moa','appliquee','annulee') DEFAULT 'proposee',
  decided_by INT UNSIGNED,
  decided_at TIMESTAMP NULL,
  decision_comment TEXT,
  applied_on_certificat_id INT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE,
  FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE,
  FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE,
  FOREIGN KEY (proposed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────
-- COURRIERS (Automated correspondence)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courriers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  type ENUM(
    -- OPC courriers (5)
    'opc_demande_complement','opc_mise_en_demeure','opc_validation',
    'opc_refus_definitif','opc_penalite',
    -- MOE courriers (7)
    'moe_erreur_calcul','moe_certificat_pret','moe_transmission_moa',
    'moe_demande_correction','moe_renvoi_opc','moe_relance','moe_cloture'
  ) NOT NULL,
  destinataire_id INT UNSIGNED NOT NULL,
  destinataire_email VARCHAR(255) NOT NULL,
  objet VARCHAR(500) NOT NULL,
  contenu TEXT NOT NULL,
  -- Delivery
  mode_envoi ENUM('email','ar24','rar','recommande') DEFAULT 'email',
  envoi_status ENUM('brouillon','envoye','distribue','erreur') DEFAULT 'brouillon',
  date_envoi TIMESTAMP NULL,
  date_distribution TIMESTAMP NULL,
  -- Link to entities
  lot_id INT UNSIGNED,
  entreprise_id INT UNSIGNED,
  situation_id INT UNSIGNED,
  certificat_id INT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────
-- Extend situations with OPC control fields
-- ───────────────────────────────────────────────────────────
ALTER TABLE situations
  ADD COLUMN opc_avancement_valide DECIMAL(5,2) AFTER avancement_physique,
  ADD COLUMN opc_ecart_planning DECIMAL(5,2) AFTER opc_avancement_valide,
  ADD COLUMN opc_alerte_type ENUM('none','deviation','anomaly','penalty') DEFAULT 'none' AFTER opc_ecart_planning,
  ADD COLUMN moe_ecart_montant DECIMAL(15,2) DEFAULT 0.00 AFTER montant_valide_ht,
  ADD COLUMN moe_ecart_pourcent DECIMAL(5,2) DEFAULT 0.00 AFTER moe_ecart_montant,
  ADD COLUMN moe_controle_auto ENUM('vert','orange','rouge') DEFAULT 'vert' AFTER moe_ecart_pourcent,
  ADD COLUMN certificat_id INT UNSIGNED AFTER moe_controle_auto;
