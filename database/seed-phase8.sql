-- ══════════════════════════════════════════════════════════════
-- NOMOΣ — Phase 8 : Seed Data (Sous-traitance + Groupements)
-- νόμος — The Standard, The Rule
-- ══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- SOUS-TRAITANT EXEMPLE (Lot 03 - TOTEM)
-- ═══════════════════════════════════════════════════════════

INSERT INTO sous_traitants (
  tenant_id,
  operation_id,
  lot_id,
  entreprise_titulaire_id,
  name,
  siret,
  contact_name,
  contact_email,
  contact_phone,
  montant_ht,
  perimetre,
  paiement_mode,
  agrement_status,
  date_soumission,
  agrement_delai_jours,
  agrement_silence_vaut,
  cumul_paye
) VALUES (
  1, -- tenant_id
  1, -- operation_id (TOTEM)
  3, -- lot_id (Lot 03)
  5, -- entreprise_titulaire_id (BERNARDI PIERRE)
  'SOUS-TRAITANCE ÉLECTRICITÉ PRO',
  '85234567890123',
  'Jean DUPONT',
  'j.dupont@st-elec-pro.fr',
  '0612345678',
  45000.00,
  'Installation tableaux électriques secondaires + câblage basse tension',
  'direct',
  'soumis_moe',
  '2025-01-15',
  21,
  'acceptation',
  0.00
);

SET @st_id = LAST_INSERT_ID();

-- ═══════════════════════════════════════════════════════════
-- DOCUMENTS DC4 EXEMPLE
-- ═══════════════════════════════════════════════════════════

INSERT INTO st_documents (tenant_id, sous_traitant_id, type, file_path, status, expires_at) VALUES
(1, @st_id, 'dc4', '/uploads/st/dc4_st_elec_pro.pdf', 'validated', NULL),
(1, @st_id, 'kbis', '/uploads/st/kbis_st_elec_pro.pdf', 'validated', '2025-12-31'),
(1, @st_id, 'urssaf', '/uploads/st/urssaf_st_elec_pro.pdf', 'validated', '2025-06-30'),
(1, @st_id, 'attestation_fiscale', '/uploads/st/fiscale_st_elec_pro.pdf', 'validated', '2025-12-31'),
(1, @st_id, 'rc_pro', '/uploads/st/rc_pro_st_elec_pro.pdf', 'validated', '2026-03-31'),
(1, @st_id, 'decennale', '/uploads/st/decennale_st_elec_pro.pdf', 'validated', '2026-12-31'),
(1, @st_id, 'contrat_st', '/uploads/st/contrat_st_elec_pro.pdf', 'validated', NULL),
(1, @st_id, 'rib', '/uploads/st/rib_st_elec_pro.pdf', 'validated', NULL),
(1, @st_id, 'references', '/uploads/st/references_st_elec_pro.pdf', 'pending', NULL),
(1, @st_id, 'qualifications', '/uploads/st/qualifications_st_elec_pro.pdf', 'pending', NULL);

-- ═══════════════════════════════════════════════════════════
-- GROUPEMENT EXEMPLE (Lot 01 - TOTEM)
-- ═══════════════════════════════════════════════════════════

-- Groupement solidaire avec 2 membres
INSERT INTO groupements (
  tenant_id,
  operation_id,
  lot_id,
  type,
  mandataire_id,
  mandataire_solidaire,
  certificat_mode
) VALUES (
  1, -- tenant_id
  1, -- operation_id (TOTEM)
  1, -- lot_id (Lot 01)
  'solidaire',
  1, -- mandataire_id (DURAND CHRISTOPHE)
  TRUE,
  'unique'
);

SET @groupement_id = LAST_INSERT_ID();

-- Membres du groupement
INSERT INTO groupement_membres (tenant_id, groupement_id, entreprise_id, is_mandataire, part_pourcent, montant_part) VALUES
(1, @groupement_id, 1, TRUE, 60.00, 360000.00),  -- DURAND CHRISTOPHE (mandataire)
(1, @groupement_id, 2, FALSE, 40.00, 240000.00); -- MAROIS SOPHIE

-- ══════════════════════════════════════════════════════════════
-- NOMOΣ — © 2026 POLARIS CONSEIL — Groupe QUESTOR
-- ══════════════════════════════════════════════════════════════
