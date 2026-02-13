-- ══════════════════════════════════════════════════════════════
-- NOMOΣ — Phase 6: Révision de Prix
-- Migration SQL
-- ══════════════════════════════════════════════════════════════

-- Revision formulas per lot
CREATE TABLE IF NOT EXISTS revision_formules (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  lot_id INT UNSIGNED NOT NULL,
  type ENUM('mono_indice','parametrique','personnalisee') DEFAULT 'mono_indice',
  -- Mono-indice: P = P0 × (a + b × BT/BT0)
  indice_code VARCHAR(20) DEFAULT 'BT01',
  indice_base_value DECIMAL(10,4),
  mois_reference DATE,
  partie_fixe DECIMAL(5,4) DEFAULT 0.1500,
  partie_variable DECIMAL(5,4) DEFAULT 0.8500,
  -- Parametric (multi-indices): stored as JSON
  -- Format: [{"indice":"BT01","coef":0.40},{"indice":"BT07","coef":0.30},{"indice":"BT34","coef":0.15}]
  parametres JSON,
  -- Clause butoir
  has_butoir BOOLEAN DEFAULT FALSE,
  butoir_pourcent DECIMAL(5,2) DEFAULT 15.00,
  -- Clause sauvegarde
  has_sauvegarde BOOLEAN DEFAULT FALSE,
  sauvegarde_seuil DECIMAL(5,2) DEFAULT 20.00,
  -- Revision negative
  revision_negative_applicable BOOLEAN DEFAULT TRUE,
  -- Status
  validated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE,
  FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Monthly indices cache (from INSEE API)
CREATE TABLE IF NOT EXISTS indices_insee (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  mois DATE NOT NULL,
  valeur DECIMAL(10,4) NOT NULL,
  is_provisoire BOOLEAN DEFAULT FALSE,
  source ENUM('api_insee','manual') DEFAULT 'api_insee',
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_indice (code, mois)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Monthly revision calculations per lot
CREATE TABLE IF NOT EXISTS revision_calculs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  operation_id INT UNSIGNED NOT NULL,
  lot_id INT UNSIGNED NOT NULL,
  situation_id INT UNSIGNED NOT NULL,
  certificat_id INT UNSIGNED,
  mois DATE NOT NULL,
  -- Indices used
  indice_base DECIMAL(10,4),
  indice_mois DECIMAL(10,4),
  is_indice_provisoire BOOLEAN DEFAULT FALSE,
  -- Calculation
  coefficient_k DECIMAL(8,6) DEFAULT 1.000000,
  montant_travaux_ht DECIMAL(15,2) DEFAULT 0.00,
  montant_revision DECIMAL(15,2) DEFAULT 0.00,
  -- Butoir applied?
  butoir_applique BOOLEAN DEFAULT FALSE,
  k_avant_butoir DECIMAL(8,6),
  -- Cumuls
  cumul_revision DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE,
  FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE,
  FOREIGN KEY (situation_id) REFERENCES situations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
