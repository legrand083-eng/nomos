-- ═══════════════════════════════════════════════════════════
-- NOMOΣ Phase 3 — Seed data for Portail Entreprise
-- ═══════════════════════════════════════════════════════════

-- Documents for entreprise Azur BTP Group (lot 03)
INSERT INTO documents (tenant_id, operation_id, entreprise_id, type, name, file_path, file_size, uploaded_by, status, created_at) VALUES
(1, 1, 1, 'kbis', 'KBIS_AzurBTP_2025.pdf', '/uploads/1/1/kbis_azur.pdf', 245000, 5, 'validated', '2025-03-01'),
(1, 1, 1, 'assurance_rc', 'RC_Pro_AzurBTP_2025.pdf', '/uploads/1/1/rc_azur.pdf', 180000, 5, 'validated', '2025-03-01'),
(1, 1, 1, 'assurance_decennale', 'Decennale_AzurBTP_2025.pdf', '/uploads/1/1/dec_azur.pdf', 210000, 5, 'validated', '2025-03-01'),
(1, 1, 1, 'rib', 'RIB_AzurBTP.pdf', '/uploads/1/1/rib_azur.pdf', 52000, 5, 'validated', '2025-03-01'),
(1, 1, 1, 'dpgf', 'DPGF_Lot03_GO.pdf', '/uploads/1/1/dpgf_lot03.pdf', 890000, 5, 'validated', '2025-03-01');

-- Sample situations for lot 03
INSERT INTO situations (tenant_id, operation_id, lot_id, entreprise_id, numero, mois_reference, montant_ht_cumul, montant_ht_mois, status, date_depot, date_controle_opc, date_controle_moe, avancement_physique, montant_valide_ht, modifiable) VALUES
(1, 1, 3, 1, 1, '2025-04-01', 120000.00, 120000.00, 'payee', '2025-04-22', '2025-04-24', '2025-04-28', 8.28, 118500.00, FALSE),
(1, 1, 3, 1, 2, '2025-05-01', 285000.00, 165000.00, 'payee', '2025-05-23', '2025-05-26', '2025-05-29', 19.66, 163200.00, FALSE),
(1, 1, 3, 1, 3, '2025-06-01', 480000.00, 195000.00, 'validee_moa', '2025-06-24', '2025-06-26', '2025-06-30', 33.10, 194000.00, FALSE),
(1, 1, 3, 1, 4, '2025-07-01', 620000.00, 140000.00, 'controle_moe', '2025-07-23', '2025-07-25', NULL, 42.76, NULL, FALSE);

-- Sample notifications
INSERT INTO notifications (tenant_id, user_id, operation_id, type, title, message, is_popup, priority) VALUES
(1, 5, 1, 'certificat_genere', 'Certificat n°3 à signer', 'Le certificat de paiement pour votre situation n°3 (Lot 03) est prêt. Veuillez le vérifier et le signer.', TRUE, 'high'),
(1, 5, 1, 'info', 'Courrier MOE reçu', 'Un courrier du MOE concernant le lot 03 a été déposé dans vos documents.', FALSE, 'low');
