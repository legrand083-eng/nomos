-- ═══════════════════════════════════════════════════════════════
-- NOMOΣ — Database Schema v1.0
-- Target: MySQL 8.x (O2Switch)
-- νόμος — The Standard, The Rule
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ───────────────────────────────────────────────────────────────
-- TENANTS (multi-tenancy via tenant_id column)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  siret VARCHAR(14),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  plan ENUM('standard', 'professional', 'enterprise') NOT NULL DEFAULT 'standard',
  status ENUM('active', 'suspended', 'cancelled') NOT NULL DEFAULT 'active',
  storage_quota_mb INT UNSIGNED NOT NULL DEFAULT 102400,
  storage_used_mb INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────
-- USERS
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'moe', 'opc', 'moa', 'entreprise', 'comptabilite') NOT NULL,
  status ENUM('active', 'inactive', 'locked') NOT NULL DEFAULT 'active',
  phone VARCHAR(20),
  last_login_at TIMESTAMP NULL,
  failed_login_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until TIMESTAMP NULL,
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  brise_glace_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
  brise_glace_reset_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_email (tenant_id, email),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────
-- SESSIONS (single session per user)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  refresh_token VARCHAR(500) NOT NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  locked_at TIMESTAMP NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_session_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────
-- OPERATIONS (construction projects)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS operations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(300) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  moa_name VARCHAR(200),
  moa_siret VARCHAR(14),
  ccag_version ENUM('2021', '2009') NOT NULL DEFAULT '2021',
  status ENUM('setup', 'active', 'reception', 'dgd', 'archived') NOT NULL DEFAULT 'setup',
  start_date DATE,
  end_date DATE,
  total_ht DECIMAL(15,2) DEFAULT 0.00,
  retention_rate DECIMAL(5,2) DEFAULT 5.00,
  payment_delay_days TINYINT UNSIGNED DEFAULT 30,
  penalty_rate_bce_plus DECIMAL(5,2) DEFAULT 8.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_op_code (tenant_id, code),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────
-- LOTS (work packages within an operation)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lots (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  number VARCHAR(10) NOT NULL,
  name VARCHAR(300) NOT NULL,
  entreprise_id INT UNSIGNED,
  montant_marche_ht DECIMAL(15,2) DEFAULT 0.00,
  tva_rate DECIMAL(5,2) DEFAULT 20.00,
  indice_base VARCHAR(20),
  indice_type ENUM('BT', 'TP') DEFAULT 'BT',
  status ENUM('active', 'reception', 'dgd', 'archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_lot_num (operation_id, number),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────
-- ENTREPRISES (contractors)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS entreprises (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  name VARCHAR(300) NOT NULL,
  siret VARCHAR(14),
  siren VARCHAR(9),
  naf_code VARCHAR(10),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  contact_name VARCHAR(200),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  iban VARCHAR(34),
  bic VARCHAR(11),
  assurance_rc_expire DATE,
  assurance_decennale_expire DATE,
  kbis_date DATE,
  status ENUM('active', 'incomplete', 'blocked', 'archived') NOT NULL DEFAULT 'incomplete',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────
-- USER_OPERATIONS (many-to-many: which users access which operations)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_operations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  role_override ENUM('moe', 'opc', 'moa', 'entreprise', 'comptabilite') NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_op (user_id, operation_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────
-- AUDIT LOG (every action is logged)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT UNSIGNED,
  details JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  hash_sha256 VARCHAR(64),
  previous_hash VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_tenant (tenant_id),
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_date (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════
-- END OF SCHEMA — NOMOΣ v1.0
-- ═══════════════════════════════════════════════════════════════
