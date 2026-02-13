-- ═══════════════════════════════════════════════════════════
-- NOMOΣ — Phase 7: AVANCES + PÉNALITÉS
-- Seed Data
-- Date: 13 février 2026
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- AVANCES
-- ═══════════════════════════════════════════════════════════

-- Avance forfaitaire lot 03 (Gros œuvre) — TOTEM
INSERT INTO avances (tenant_id, operation_id, lot_id, entreprise_id, type, taux, base_calcul, montant_marche, montant_avance, seuil_debut_remb, seuil_fin_remb, date_versement, status, cumul_rembourse, solde_restant) VALUES
(1, 1, 3, 1, 'forfaitaire', 5.00, 'ttc', 1740000.00, 87000.00, 65.00, 80.00, '2025-04-01', 'en_remboursement', 0.00, 87000.00);

-- ═══════════════════════════════════════════════════════════
-- PÉNALITÉS BARÈME
-- ═══════════════════════════════════════════════════════════

-- Barème pénalités opération TOTEM (référence CCAG 2021 + CCAP)
INSERT INTO penalite_baremes (tenant_id, operation_id, type, libelle, reference_ccap, mode_calcul, montant_unitaire, base_pourcentage) VALUES
(1, 1, 'retard_global', 'Retard d''exécution global', 'Art. 20.1 CCAG 2021', 'par_jour', 483.33, 'forfait'),
(1, 1, 'retard_jalon', 'Retard jalon intermédiaire', 'Art. 20.2 CCAG 2021', 'par_jour', 250.00, 'forfait'),
(1, 1, 'absence_reunion', 'Absence réunion de chantier', 'Art. 8.3 CCAP', 'forfait', 200.00, 'forfait'),
(1, 1, 'defaut_nettoyage', 'Défaut de nettoyage', 'Art. 12.1 CCAP', 'forfait', 150.00, 'forfait'),
(1, 1, 'non_port_epi', 'Non-port EPI', 'Art. 5.2 CCAP', 'forfait', 100.00, 'forfait'),
(1, 1, 'retard_situation', 'Retard dépôt situation', 'Art. 13.3 CCAP', 'par_jour', 50.00, 'forfait'),
(1, 1, 'non_conformite', 'Non-conformité travaux', 'Art. 24.1 CCAG 2021', 'pourcentage', 2.00, 'situation_ht'),
(1, 1, 'autre', 'Autre pénalité', 'Art. 20.3 CCAG 2021', 'forfait', 100.00, 'forfait');

-- ═══════════════════════════════════════════════════════════
-- END SEED PHASE 7
-- ═══════════════════════════════════════════════════════════
