-- ═══════════════════════════════════════════════════════════
-- NOMOΣ — PHASE 11: SEED DATA
-- Archivage + RGPD + Security Events
-- ═══════════════════════════════════════════════════════════

-- Archives (sample documents)
INSERT INTO archives (tenant_id, operation_id, type, reference, description, file_path, file_size, sha256_hash, mime_type, date_document, date_expiration, retention_years, archived_by, verified_hash) VALUES
(1, 1, 'certificat', 'CERT-2024-001', 'Certificat de paiement n°1', '/archives/1/1/2024/cert-001.pdf', 245678, 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd', 'application/pdf', '2024-01-15', '2034-01-15', 10, 1, TRUE),
(1, 1, 'dgd', 'DGD-2024-001', 'Décompte général définitif', '/archives/1/1/2024/dgd-001.pdf', 512345, 'b2c3d4e5f6789012345678901234567890123456789012345678901234abcde', 'application/pdf', '2024-06-30', '2034-06-30', 10, 1, TRUE),
(1, 1, 'pv_reception', 'PV-REC-2024-001', 'PV de réception des travaux', '/archives/1/1/2024/pv-rec-001.pdf', 189234, 'c3d4e5f6789012345678901234567890123456789012345678901234abcdef1', 'application/pdf', '2024-05-20', '2044-05-20', 20, 1, TRUE),
(1, 2, 'contrat', 'CONT-2024-002', 'Contrat de marché public', '/archives/1/2/2024/contrat-002.pdf', 678901, 'd4e5f6789012345678901234567890123456789012345678901234abcdef12', 'application/pdf', '2024-02-10', '2034-02-10', 10, 2, TRUE);

-- RGPD Consents
INSERT INTO rgpd_consents (user_id, consent_type, consented, consented_at, ip_address, user_agent) VALUES
(1, 'terms', TRUE, '2024-01-01 10:00:00', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(1, 'privacy', TRUE, '2024-01-01 10:00:00', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(1, 'cookies', TRUE, '2024-01-01 10:00:00', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(1, 'data_processing', TRUE, '2024-01-01 10:00:00', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(2, 'terms', TRUE, '2024-01-05 14:30:00', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
(2, 'privacy', TRUE, '2024-01-05 14:30:00', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
(3, 'terms', TRUE, '2024-01-10 09:15:00', '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64)'),
(3, 'privacy', TRUE, '2024-01-10 09:15:00', '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64)');

-- RGPD Requests (sample)
INSERT INTO rgpd_requests (tenant_id, user_id, type, status, requested_at, notes) VALUES
(1, 5, 'export', 'completed', '2024-02-01 10:00:00', 'Export de données personnelles traité'),
(1, 6, 'erasure', 'pending', '2024-02-15 14:30:00', 'Demande de suppression en attente de validation'),
(1, 7, 'rectification', 'completed', '2024-02-10 11:20:00', 'Correction des informations personnelles effectuée');

-- Security Events
INSERT INTO security_events (tenant_id, user_id, type, severity, ip_address, user_agent, details) VALUES
(1, 1, 'login_success', 'info', '192.168.1.100', 'Mozilla/5.0', 'Connexion réussie'),
(1, NULL, 'login_failed', 'warning', '192.168.1.200', 'Mozilla/5.0', 'Tentative de connexion échouée - utilisateur inconnu'),
(1, 2, 'password_change', 'info', '192.168.1.101', 'Mozilla/5.0', 'Changement de mot de passe'),
(1, NULL, 'brute_force', 'critical', '203.0.113.45', 'curl/7.68.0', 'Détection de tentatives multiples de connexion'),
(1, 1, 'admin_action', 'warning', '192.168.1.100', 'Mozilla/5.0', 'Modification des permissions utilisateur'),
(1, 3, 'data_export', 'warning', '192.168.1.102', 'Mozilla/5.0', 'Export de données RGPD'),
(1, NULL, 'suspicious_ip', 'critical', '198.51.100.23', 'Python-requests/2.28', 'Accès depuis IP suspecte'),
(1, 1, 'role_change', 'warning', '192.168.1.100', 'Mozilla/5.0', 'Changement de rôle utilisateur');

-- ═══════════════════════════════════════════════════════════
-- END OF SEED PHASE 11
-- ═══════════════════════════════════════════════════════════
