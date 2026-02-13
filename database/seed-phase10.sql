-- ══════════════════════════════════════════════════════════════
-- NOMOΣ — PHASE 10: ADMIN M1 + INTERFACES API
-- Seed Data
-- Date: 13 February 2026
-- ══════════════════════════════════════════════════════════════

-- Tenant settings (POLARIS CONSEIL)
INSERT INTO tenant_settings (tenant_id, tenant_name, tenant_slug, statut, plan, max_operations, max_users, max_storage_gb, rg_default, penalite_plafond, features) VALUES
(1, 'POLARIS CONSEIL', 'polaris', 'actif', 'enterprise', 100, 50, 500, 5.00, 10.00, '{"revision_prix": true, "sous_traitance": true, "groupements": true, "compte_prorata": true}');

-- System alerts (demo)
INSERT INTO system_alerts (type, severity, message, details, resolved) VALUES
('security', 'high', 'Tentative de connexion suspecte détectée', '{"ip": "192.168.1.100", "user": "admin@demo.com", "attempts": 5}', FALSE),
('performance', 'medium', 'Temps de réponse API élevé', '{"endpoint": "/api/certificats", "avg_time_ms": 1200}', TRUE),
('error', 'low', 'Erreur lors de l\'envoi d\'email', '{"template": "notification_depot", "error": "SMTP timeout"}', TRUE);

-- Tickets support (demo)
INSERT INTO tickets (numero, titre, description, priorite, statut, categorie, user_id, assigned_to, sla_deadline) VALUES
('TICK-2026-001', 'Impossible de générer le certificat de paiement', 'Le bouton "Générer certificat" ne répond pas après validation MOE.', 'haute', 'en_cours', 'Bug', 2, 1, DATE_ADD(NOW(), INTERVAL 4 HOUR)),
('TICK-2026-002', 'Demande de formation sur la révision de prix', 'Nous souhaitons une formation pour notre équipe sur le module de révision de prix.', 'normale', 'ouvert', 'Formation', 3, NULL, DATE_ADD(NOW(), INTERVAL 2 DAY)),
('TICK-2026-003', 'Erreur de calcul des pénalités', 'Les pénalités calculées semblent incorrectes pour le lot 2.', 'critique', 'resolu', 'Bug', 4, 1, DATE_ADD(NOW(), INTERVAL 2 HOUR));

-- Audit logs (demo)
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, ip_address) VALUES
(1, 'UPDATE', 'operation', 1, '{"statut": "en_cours"}', '{"statut": "termine"}', '192.168.1.10'),
(2, 'CREATE', 'certificat', 1, NULL, '{"numero": "CERT-2026-001", "montant_ht": 50000}', '192.168.1.20'),
(3, 'DELETE', 'penalite', 5, '{"montant": 500, "motif": "Retard"}', NULL, '192.168.1.30');

-- Login attempts (demo)
INSERT INTO login_attempts (email, ip_address, success) VALUES
('christophe@polarisconseil.pro', '192.168.1.10', TRUE),
('moe@demo-nomos.pro', '192.168.1.20', TRUE),
('hacker@malicious.com', '203.0.113.50', FALSE),
('hacker@malicious.com', '203.0.113.50', FALSE),
('hacker@malicious.com', '203.0.113.50', FALSE);

-- Backups (demo)
INSERT INTO backups (type, status, size_mb, storage_path, started_at, completed_at) VALUES
('daily', 'completed', 245.67, '/backups/2026-02-12-daily.sql.gz', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 23 HOUR)),
('weekly', 'completed', 1024.50, '/backups/2026-02-09-weekly.sql.gz', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
('daily', 'completed', 248.12, '/backups/2026-02-13-daily.sql.gz', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- Holidays (French national holidays 2026)
INSERT INTO holidays (date, name, type) VALUES
('2026-01-01', 'Jour de l\'An', 'national'),
('2026-04-06', 'Lundi de Pâques', 'national'),
('2026-05-01', 'Fête du Travail', 'national'),
('2026-05-08', 'Victoire 1945', 'national'),
('2026-05-14', 'Ascension', 'national'),
('2026-05-25', 'Lundi de Pentecôte', 'national'),
('2026-07-14', 'Fête Nationale', 'national'),
('2026-08-15', 'Assomption', 'national'),
('2026-11-01', 'Toussaint', 'national'),
('2026-11-11', 'Armistice 1918', 'national'),
('2026-12-25', 'Noël', 'national');

-- ══════════════════════════════════════════════════════════════
-- END OF SEED PHASE 10
-- ══════════════════════════════════════════════════════════════
