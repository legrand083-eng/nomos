-- ═══════════════════════════════════════════════════════════
-- NOMOΣ Phase 5 — Dashboard MOA + Système de Notifications
-- ═══════════════════════════════════════════════════════════

-- Extend operations with MOA settings
ALTER TABLE operations
  ADD COLUMN moa_validation_required BOOLEAN DEFAULT TRUE
    AFTER pedigree_completion,
  ADD COLUMN moa_auto_payment_delay TINYINT UNSIGNED DEFAULT 30
    AFTER moa_validation_required;

-- ───────────────────────────────────────────────────────────
-- EMAIL_TEMPLATES (Notification templates)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_templates (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED,
  code VARCHAR(50) NOT NULL UNIQUE,
  category ENUM('workflow','alerte','cloture','assurance') NOT NULL,
  objet_template VARCHAR(500) NOT NULL,
  contenu_template TEXT NOT NULL,
  destinataire_role ENUM('entreprise','moe','opc','moa','admin','all') NOT NULL,
  variables TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────
-- EMAIL_LOG (Sent emails tracking)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_log (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  template_id INT UNSIGNED,
  operation_id INT UNSIGNED,
  lot_id INT UNSIGNED,
  entreprise_id INT UNSIGNED,
  destinataire_email VARCHAR(255) NOT NULL,
  destinataire_name VARCHAR(300),
  objet VARCHAR(500) NOT NULL,
  contenu TEXT NOT NULL,
  mode ENUM('email','ar24','rar','sms') DEFAULT 'email',
  status ENUM('pending','sent','delivered','failed','bounced') DEFAULT 'pending',
  sent_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES email_templates(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────
-- PERFORMANCE TRACKING (MOE/OPC processing times)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS performance_tracking (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  situation_id INT UNSIGNED NOT NULL,
  lot_id INT UNSIGNED NOT NULL,
  date_depot TIMESTAMP NOT NULL,
  date_controle_opc TIMESTAMP NULL,
  date_controle_moe TIMESTAMP NULL,
  date_certificat TIMESTAMP NULL,
  date_validation_moa TIMESTAMP NULL,
  date_paiement TIMESTAMP NULL,
  duree_opc_heures DECIMAL(8,2) DEFAULT 0,
  duree_moe_heures DECIMAL(8,2) DEFAULT 0,
  duree_moa_heures DECIMAL(8,2) DEFAULT 0,
  duree_totale_heures DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE,
  FOREIGN KEY (situation_id) REFERENCES situations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
