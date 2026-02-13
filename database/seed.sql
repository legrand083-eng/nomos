-- ═══════════════════════════════════════════════════════════════
-- NOMOΣ — Seed Data v1.0
-- Realistic French BTP demo data
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

-- ───────────────────────────────────────────────────────────────
-- TENANT
-- ───────────────────────────────────────────────────────────────
INSERT INTO tenants (id, slug, name, siret, email, phone, address, plan, status) VALUES
(1, 'polaris', 'POLARIS CONSEIL', '82345678901234', 'contact@polarisconseil.pro', '06 72 33 11 70', '15 rue des Fossés, 16200 JARNAC', 'enterprise', 'active');

-- ───────────────────────────────────────────────────────────────
-- USERS (passwords: bcrypt hash of 'Nomos2026!')
-- ───────────────────────────────────────────────────────────────
INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, role, status, phone) VALUES
(1, 1, 'christophe@polarisconseil.pro', '$2b$12$I0hwNaG2u6KHkYL4Z3K.ZO7jMsV0zt3PkYCVVpzuGYr5SUtcCk3ji', 'Christophe', 'DURAND', 'admin', 'active', '06 72 33 11 70'),
(2, 1, 'moe@demo-nomos.pro', '$2b$12$I0hwNaG2u6KHkYL4Z3K.ZO7jMsV0zt3PkYCVVpzuGYr5SUtcCk3ji', 'Sophie', 'MARTIN', 'moe', 'active', '06 11 22 33 44'),
(3, 1, 'opc@demo-nomos.pro', '$2b$12$I0hwNaG2u6KHkYL4Z3K.ZO7jMsV0zt3PkYCVVpzuGYr5SUtcCk3ji', 'Jean', 'DUBOIS', 'opc', 'active', '06 22 33 44 55'),
(4, 1, 'moa@demo-nomos.pro', '$2b$12$I0hwNaG2u6KHkYL4Z3K.ZO7jMsV0zt3PkYCVVpzuGYr5SUtcCk3ji', 'Marie', 'LEROY', 'moa', 'active', '06 33 44 55 66'),
(5, 1, 'entreprise@demo-nomos.pro', '$2b$12$I0hwNaG2u6KHkYL4Z3K.ZO7jMsV0zt3PkYCVVpzuGYr5SUtcCk3ji', 'Pierre', 'BERNARD', 'entreprise', 'active', '06 44 55 66 77'),
(6, 1, 'compta@demo-nomos.pro', '$2b$12$I0hwNaG2u6KHkYL4Z3K.ZO7jMsV0zt3PkYCVVpzuGYr5SUtcCk3ji', 'Claire', 'PETIT', 'comptabilite', 'active', '06 55 66 77 88');

-- ───────────────────────────────────────────────────────────────
-- OPERATION
-- ───────────────────────────────────────────────────────────────
INSERT INTO operations (id, tenant_id, code, name, address, city, postal_code, moa_name, moa_siret, ccag_version, status, start_date, end_date, total_ht, retention_rate, payment_delay_days) VALUES
(1, 1, 'P388L', 'Opération TOTEM — 31 logements locatifs', '9 route des Vespins', 'ST LAURENT DU VAR', '06700', '3F SUD', '31234567890123', '2021', 'active', '2025-03-01', '2027-06-30', 4850000.00, 5.00, 30);

-- ───────────────────────────────────────────────────────────────
-- ENTREPRISES (contractors)
-- ───────────────────────────────────────────────────────────────
INSERT INTO entreprises (id, tenant_id, name, siret, address, city, postal_code, contact_name, contact_email, contact_phone, status) VALUES
(1, 1, 'S.M.D.T Démolition & Terrassement', '40496486800024', 'ZA Sur le Jura', 'AVOUDREY', '25690', 'Marc FONTAINE', 'contact@smdt-tp.fr', '03 81 43 21 77', 'active'),
(2, 1, 'CLIVIO Travaux Spéciaux', '40496486800024', '5 ZA Sur le Jura', 'AVOUDREY', '25690', 'Luc CLIVIO', 'contact@clivio-ts.fr', '03 81 43 21 77', 'active'),
(3, 1, 'Azur BTP Group', '55234567800019', '128 avenue de Nice', 'ANTIBES', '06600', 'Thomas GIRARD', 'contact@azurbtpgroup.fr', '04 93 12 34 56', 'active'),
(4, 1, 'Méditerranée Plomberie', '66345678900028', '45 boulevard Carnot', 'NICE', '06000', 'Antoine ROUX', 'contact@med-plomberie.fr', '04 93 87 65 43', 'active'),
(5, 1, 'Riviera Électricité', '77456789000037', '12 rue Pasteur', 'CAGNES-SUR-MER', '06800', 'Laurent MOREAU', 'contact@riviera-elec.fr', '04 93 45 67 89', 'active');

-- ───────────────────────────────────────────────────────────────
-- LOTS (work packages)
-- ───────────────────────────────────────────────────────────────
INSERT INTO lots (id, tenant_id, operation_id, number, name, entreprise_id, montant_marche_ht, tva_rate, indice_base, indice_type, status) VALUES
(1, 1, 1, '01A', 'Terrassements', 1, 320000.00, 20.00, 'BT01', 'BT', 'active'),
(2, 1, 1, '02', 'Soutènement — Fondations Spéciales', 2, 890000.00, 20.00, 'BT03', 'BT', 'active'),
(3, 1, 1, '03', 'Gros Œuvre', 3, 2150000.00, 20.00, 'BT06', 'BT', 'active'),
(4, 1, 1, '08', 'Plomberie — Sanitaires — CVC', 4, 680000.00, 20.00, 'BT40', 'BT', 'active'),
(5, 1, 1, '09', 'Électricité — Courants forts et faibles', 5, 810000.00, 20.00, 'BT46', 'BT', 'active');

-- ───────────────────────────────────────────────────────────────
-- USER_OPERATIONS (access control)
-- ───────────────────────────────────────────────────────────────
INSERT INTO user_operations (user_id, operation_id) VALUES
(1, 1),  -- Christophe (admin) -> TOTEM
(2, 1),  -- Sophie (MOE) -> TOTEM
(3, 1),  -- Jean (OPC) -> TOTEM
(4, 1),  -- Marie (MOA) -> TOTEM
(5, 1),  -- Pierre (entreprise) -> TOTEM
(6, 1);  -- Claire (comptabilité) -> TOTEM

-- ───────────────────────────────────────────────────────────────
-- INITIAL AUDIT LOG ENTRY
-- ───────────────────────────────────────────────────────────────
INSERT INTO audit_log (tenant_id, user_id, action, entity_type, entity_id, details, hash_sha256) VALUES
(1, 1, 'SYSTEM_INIT', 'system', NULL, '{"event":"Database initialized","version":"1.0.0","date":"2026-02-13"}', SHA2(CONCAT('SYSTEM_INIT', NOW()), 256));

-- ═══════════════════════════════════════════════════════════════
-- END OF SEED DATA — NOMOΣ v1.0
-- ═══════════════════════════════════════════════════════════════
