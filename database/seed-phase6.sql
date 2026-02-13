-- ══════════════════════════════════════════════════════════════
-- NOMOΣ — Phase 6: Révision de Prix
-- Seed Data
-- ══════════════════════════════════════════════════════════════

-- Sample indices BT01 (2024-2025)
INSERT INTO indices_insee (code, mois, valeur, source) VALUES
('BT01', '2024-01-01', 124.2, 'manual'),
('BT01', '2024-02-01', 124.5, 'manual'),
('BT01', '2024-03-01', 125.6, 'manual'),
('BT01', '2024-04-01', 125.8, 'manual'),
('BT01', '2024-05-01', 126.1, 'manual'),
('BT01', '2024-06-01', 126.4, 'manual'),
('BT01', '2024-07-01', 126.7, 'manual'),
('BT01', '2024-08-01', 127.0, 'manual'),
('BT01', '2024-09-01', 127.2, 'manual'),
('BT01', '2024-10-01', 127.5, 'manual'),
('BT01', '2024-11-01', 127.8, 'manual'),
('BT01', '2024-12-01', 128.0, 'manual'),
('BT01', '2025-01-01', 128.3, 'manual'),
('BT01', '2025-02-01', 128.5, 'manual'),
('BT01', '2025-03-01', 128.8, 'manual'),
('BT01', '2025-04-01', 129.1, 'manual'),
('BT01', '2025-05-01', 129.4, 'manual'),
('BT01', '2025-06-01', 129.7, 'manual');

-- Revision formula for lot 03 (Gros oeuvre)
INSERT INTO revision_formules (tenant_id, operation_id, lot_id, type, indice_code, indice_base_value, mois_reference, partie_fixe, partie_variable, has_butoir, butoir_pourcent, validated) VALUES
(1, 1, 3, 'mono_indice', 'BT01', 125.6, '2024-03-01', 0.1500, 0.8500, TRUE, 15.00, TRUE);

-- Sample calculations
INSERT INTO revision_calculs (tenant_id, operation_id, lot_id, situation_id, mois, indice_base, indice_mois, coefficient_k, montant_travaux_ht, montant_revision, cumul_revision) VALUES
(1, 1, 3, 1, '2025-04-01', 125.6, 129.1, 1.02368, 120000.00, 2841.60, 2841.60),
(1, 1, 3, 2, '2025-05-01', 125.6, 129.4, 1.02572, 165000.00, 4243.80, 7085.40),
(1, 1, 3, 3, '2025-06-01', 125.6, 129.7, 1.02775, 195000.00, 5411.25, 12496.65);
