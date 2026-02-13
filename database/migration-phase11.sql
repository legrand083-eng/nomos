-- ═══════════════════════════════════════════════════════════
-- NOMOΣ — PHASE 11: ARCHIVAGE + SÉCURITÉ RGPD
-- νόμος — The Standard, The Rule
-- Version: ARCHIVE-RGPD-V1-0001
-- Date: 13 February 2026
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- ARCHIVAGE (Legal document archive)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS archives (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  -- Document info
  type ENUM('certificat','dgd','courrier','pv_reception','situation','contrat','avenant','pedigree','autre') NOT NULL,
  reference VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  -- File
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT UNSIGNED DEFAULT 0,
  sha256_hash VARCHAR(64) NOT NULL,
  mime_type VARCHAR(100) DEFAULT 'application/pdf',
  -- Legal
  date_document DATE NOT NULL,
  date_archivage TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_expiration DATE NOT NULL,
  retention_years TINYINT UNSIGNED DEFAULT 10,
  valeur_probante BOOLEAN DEFAULT TRUE,
  -- Chain of custody
  archived_by INT UNSIGNED NOT NULL,
  verified_hash BOOLEAN DEFAULT FALSE,
  last_verification TIMESTAMP NULL,
  -- Status
  status ENUM('actif','expire','supprime') DEFAULT 'actif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE,
  FOREIGN KEY (archived_by) REFERENCES users(id),
  INDEX idx_tenant_operation (tenant_id, operation_id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_expiration (date_expiration)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════
-- RGPD CONSENT TRACKING
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS rgpd_consents (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  consent_type ENUM('terms','privacy','cookies','marketing','data_processing') NOT NULL,
  consented BOOLEAN DEFAULT FALSE,
  consented_at TIMESTAMP NULL,
  withdrawn_at TIMESTAMP NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_type (user_id, consent_type),
  INDEX idx_consented (consented)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════
-- RGPD DATA REQUESTS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS rgpd_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  type ENUM('export','erasure','rectification','restriction','portability') NOT NULL,
  status ENUM('pending','processing','completed','refused') DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  processed_by INT UNSIGNED,
  notes TEXT,
  export_path VARCHAR(500),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_type (type),
  INDEX idx_requested (requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════
-- SECURITY EVENTS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS security_events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED,
  user_id INT UNSIGNED,
  type ENUM('login_success','login_failed','login_locked','brute_force','session_hijack','suspicious_ip','data_export','password_change','role_change','admin_action') NOT NULL,
  severity ENUM('info','warning','critical') DEFAULT 'info',
  ip_address VARCHAR(45),
  user_agent TEXT,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_severity (severity),
  INDEX idx_type (type),
  INDEX idx_created (created_at),
  INDEX idx_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════
-- END OF MIGRATION PHASE 11
-- ═══════════════════════════════════════════════════════════
