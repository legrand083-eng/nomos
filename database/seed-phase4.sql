-- ═══════════════════════════════════════════════════════════
-- NOMOΣ Phase 4 — Seed data for Workflow Principal
-- ═══════════════════════════════════════════════════════════

-- Sample certificate for lot 03 situation 3
INSERT INTO certificats (
  tenant_id, operation_id, lot_id, entreprise_id, situation_id,
  numero, mois_reference, config_type,
  moe_name, moe_siret, moa_name, entreprise_name,
  lot_numero, lot_name,
  montant_marche_initial, montant_avenants, montant_marche_total,
  montant_cumul_precedent, montant_cumul_actuel, montant_mois_ht,
  retenue_garantie_rate, retenue_garantie_montant,
  penalites_montant, prorata_montant, avance_remboursement,
  revision_applicable, revision_coefficient, revision_montant,
  tva_rate, tva_autoliquidation,
  montant_ht, montant_tva, montant_ttc,
  rg_after_tva, net_a_payer,
  status, is_provisoire, date_generation
) VALUES (
  1, 1, 3, 1, 3,
  'CERT-P388L-03-003', '2025-06-01', 'simple',
  'POLARIS CONSEIL', '82345678901234', '3F SUD', 'Azur BTP Group',
  '03', 'Gros œuvre — Structure béton',
  1450000.00, 0.00, 1450000.00,
  285000.00, 480000.00, 195000.00,
  5.00, 9750.00,
  0.00, 2925.00, 0.00,
  TRUE, 1.023400, 4555.30,
  20.00, FALSE,
  186880.30, 37376.06, 224256.36,
  11212.82, 213043.54,
  'signe_entreprise', TRUE, '2025-07-02 10:00:00'
);

-- OPC courrier sample
INSERT INTO courriers (tenant_id, operation_id, type, destinataire_id, destinataire_email, objet, contenu, mode_envoi, envoi_status, date_envoi, lot_id, entreprise_id, situation_id) VALUES
(1, 1, 'opc_validation', 2, 'christophe@polarisconseil.pro', 'Validation avancement Lot 03 — Situation n°3 — Juin 2025', 'Monsieur,\n\nNous vous informons que la situation de travaux n°3 du Lot 03 (Gros œuvre) déposée par Azur BTP Group a été contrôlée et validée.\n\nAvancement validé : 33,10%\n\nLe dossier est transmis pour contrôle financier.\n\nCordialement,\nOPC COORDINATION SUD', 'email', 'envoye', '2025-06-27 09:00:00', 3, 1, 3);

-- Penalty sample
INSERT INTO penalites (tenant_id, operation_id, lot_id, entreprise_id, type, motif, reference_ccap, montant, mode, proposed_by, status) VALUES
(1, 1, 5, 3, 'retard_depot', 'Retard de dépôt de 5 jours — Situation n°2', 'Article 20.1 CCAG 2021', 750.00, 'provisoire', 3, 'proposee');

-- Breaking news events (using notifications table)
INSERT INTO notifications (tenant_id, user_id, operation_id, type, title, message, priority) VALUES
(1, 2, 1, 'situation_validee', 'Lot 04 validé à 28%', 'Étanchéité Pro — Validation OPC', 'normal'),
(1, 2, 1, 'info', 'Chantier TOTEM : 47%', 'Avancement global +5% ce mois', 'low'),
(1, 2, 1, 'situation_rejetee', 'Lot 02 écart +12%', 'CLIVIO SAS — Vérification requise', 'high');

-- Update situations with OPC control data
UPDATE situations SET 
  opc_avancement_valide = 33.10,
  opc_ecart_planning = -2.50,
  opc_alerte_type = 'none',
  moe_ecart_montant = 1250.00,
  moe_ecart_pourcent = 0.65,
  moe_controle_auto = 'vert',
  certificat_id = 1
WHERE id = 3;
