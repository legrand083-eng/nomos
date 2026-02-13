-- ══════════════════════════════════════════════════════════════
-- NOMOΣ — Phase 9 : Seed Data (Compte Prorata + Réception/DGD)
-- νόμος — The Standard, The Rule
-- Date: 2026-02-13
-- ══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- COMPTE PRORATA (Opération TOTEM)
-- ═══════════════════════════════════════════════════════════

INSERT INTO compte_prorata (tenant_id, operation_id, gestionnaire_lot_id, mode_repartition, taux_prelevement, total_recettes, total_depenses, solde, status)
VALUES
(1, 1, 1, 'prorata_marche', 0.50, 15000.00, 12500.00, 2500.00, 'ouvert');

-- Dépenses prorata
INSERT INTO prorata_depenses (tenant_id, compte_prorata_id, date_depense, designation, categorie, montant_ht, entreprise_fautive_id, is_contested, arbitrage_status)
VALUES
(1, 1, '2025-03-15', 'Gardiennage chantier (Mars 2025)', 'gardiennage', 2500.00, NULL, FALSE, 'none'),
(1, 1, '2025-04-10', 'Nettoyage fin de chantier', 'nettoyage', 1800.00, NULL, FALSE, 'none'),
(1, 1, '2025-04-20', 'Réparation dégradation LOT 02 (identifiée)', 'reparation_identifie', 3200.00, 2, FALSE, 'none'),
(1, 1, '2025-05-05', 'Eau et électricité (Avril-Mai)', 'eau_electricite', 1500.00, NULL, FALSE, 'none'),
(1, 1, '2025-05-12', 'Réparation dégradation non identifiée', 'reparation_non_identifie', 2800.00, NULL, TRUE, 'en_cours'),
(1, 1, '2025-05-20', 'Vol de matériel (déclaré)', 'vol', 700.00, NULL, FALSE, 'none');

-- Répartitions prorata (5 entreprises TOTEM)
INSERT INTO prorata_repartitions (tenant_id, compte_prorata_id, entreprise_id, lot_id, part_pourcent, montant_du, montant_verse, solde)
VALUES
(1, 1, 1, 1, 35.00, 4375.00, 3000.00, 1375.00),  -- LOT 01 (35%)
(1, 1, 2, 2, 25.00, 3125.00, 2500.00, 625.00),   -- LOT 02 (25%)
(1, 1, 3, 3, 20.00, 2500.00, 2000.00, 500.00),   -- LOT 03 (20%)
(1, 1, 4, 4, 12.00, 1500.00, 1200.00, 300.00),   -- LOT 04 (12%)
(1, 1, 5, 5, 8.00, 1000.00, 800.00, 200.00);     -- LOT 05 (8%)

-- ═══════════════════════════════════════════════════════════
-- RÉCEPTION (LOT 01 + LOT 02)
-- ═══════════════════════════════════════════════════════════

INSERT INTO receptions (tenant_id, operation_id, lot_id, entreprise_id, type, date_reception, has_reserves, date_levee_reserves, date_fin_garantie_parfait, date_liberation_rg, date_fin_decennale, delai_notification_retenues, date_limite_retenues, retenues_notifiees, status)
VALUES
-- LOT 01 : Réception totale avec réserves levées
(1, 1, 1, 1, 'totale', '2025-06-15', TRUE, '2025-07-20', '2026-06-15', '2026-07-20', '2035-06-15', 30, '2025-07-15', TRUE, 'reserves_levees'),

-- LOT 02 : Réception totale sans réserves
(1, 1, 2, 2, 'totale', '2025-06-20', FALSE, NULL, '2026-06-20', '2026-06-20', '2035-06-20', 30, '2025-07-20', TRUE, 'enregistree');

-- ═══════════════════════════════════════════════════════════
-- DGD (LOT 01 uniquement — exemple)
-- ═══════════════════════════════════════════════════════════

INSERT INTO dgd (tenant_id, operation_id, lot_id, entreprise_id, reception_id, total_travaux_ht, total_revision, total_penalites, retenue_garantie, rg_liberee, total_avances_remboursees, solde_prorata, execution_aux_frais, solde_net_dgd, status, date_generation, delai_reponse_entreprise, date_limite_reponse, reponse_entreprise)
VALUES
(1, 1, 1, 1, 1, 450000.00, 12500.00, -3200.00, 22500.00, FALSE, 45000.00, -1375.00, 0.00, 390425.00, 'genere', '2025-07-25 10:00:00', 30, '2025-08-24', 'silence');

-- ══════════════════════════════════════════════════════════════
-- END OF SEED PHASE 9
-- ══════════════════════════════════════════════════════════════
