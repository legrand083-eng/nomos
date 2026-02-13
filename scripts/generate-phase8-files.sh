#!/bin/bash

# ══════════════════════════════════════════════════════════════
# NOMOΣ — Phase 8 : File Generator
# Génère tous les fichiers restants (composants + API Routes + pages)
# ══════════════════════════════════════════════════════════════

cd /home/ubuntu/nomos

# ═══════════════════════════════════════════════════════════
# COMPOSANT 2/3 : AgrementTimeline
# ═══════════════════════════════════════════════════════════

cat > src/components/ui/AgrementTimeline.js << 'EOF'
'use client';

import styles from './AgrementTimeline.module.css';

const STEPS = [
  { key: 'en_attente', label: 'Documents en attente' },
  { key: 'soumis_moe', label: 'Soumis au MOE' },
  { key: 'valide_moe', label: 'Validé MOE' },
  { key: 'soumis_moa', label: 'Soumis au MOA' },
  { key: 'agree', label: 'Agréé' }
];

export default function AgrementTimeline({ status, dates = {}, delaiJours = 21 }) {
  const currentIndex = STEPS.findIndex(s => s.key === status);

  return (
    <div className={styles.container}>
      <div className={styles.timeline}>
        {STEPS.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={step.key} className={styles.step}>
              <div className={`${styles.stepIcon} ${isCompleted ? styles.completed : ''} ${isActive ? styles.active : ''} ${isPending ? styles.pending : ''}`}>
                {isCompleted ? '✓' : index + 1}
              </div>
              <div className={styles.stepLabel}>{step.label}</div>
              {dates[step.key] && (
                <div className={styles.stepDate}>
                  {new Date(dates[step.key]).toLocaleDateString('fr-FR')}
                </div>
              )}
              {index < STEPS.length - 1 && (
                <div className={`${styles.stepLine} ${isCompleted ? styles.completed : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {status === 'soumis_moe' && (
        <div className={styles.alert}>
          ⏳ Délai de {delaiJours} jours — Silence vaut acceptation
        </div>
      )}
    </div>
  );
}
EOF

cat > src/components/ui/AgrementTimeline.module.css << 'EOF'
.container {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-21);
}

.timeline {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-8);
  flex: 1;
  position: relative;
}

.stepIcon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 700;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 2px solid var(--border-color);
  z-index: 2;
}

.stepIcon.completed {
  background: var(--success);
  color: white;
  border-color: var(--success);
}

.stepIcon.active {
  background: var(--cyan);
  color: var(--navy);
  border-color: var(--cyan);
}

.stepLabel {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

.stepDate {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-secondary);
}

.stepLine {
  position: absolute;
  top: 20px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--border-color);
  z-index: 1;
}

.stepLine.completed {
  background: var(--success);
}

.alert {
  margin-top: var(--spacing-21);
  padding: var(--spacing-13);
  background: rgba(0, 238, 255, 0.1);
  border: 1px solid var(--cyan);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--cyan);
  text-align: center;
}

:global(.dark) .container {
  background: var(--bg-secondary-dark);
  border-color: var(--border-color-dark);
}

:global(.dark) .stepIcon {
  background: var(--bg-tertiary-dark);
  color: var(--text-secondary-dark);
  border-color: var(--border-color-dark);
}

:global(.dark) .stepLabel {
  color: var(--text-primary-dark);
}

:global(.dark) .stepDate {
  color: var(--text-secondary-dark);
}

:global(.dark) .stepLine {
  background: var(--border-color-dark);
}

@media (max-width: 768px) {
  .timeline {
    flex-direction: column;
  }

  .stepLine {
    top: 40px;
    left: 20px;
    width: 2px;
    height: 100%;
  }
}
EOF

# ═══════════════════════════════════════════════════════════
# COMPOSANT 3/3 : GroupementConfig
# ═══════════════════════════════════════════════════════════

cat > src/components/ui/GroupementConfig.js << 'EOF'
'use client';

import { useState } from 'react';
import styles from './GroupementConfig.module.css';

export default function GroupementConfig({ groupement, membres = [], onUpdate, readonly = false }) {
  const [type, setType] = useState(groupement?.type || 'solidaire');
  const [certificatMode, setCertificatMode] = useState(groupement?.certificat_mode || 'unique');

  const totalPart = membres.reduce((sum, m) => sum + parseFloat(m.part_pourcent || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <label className={styles.label}>Type de groupement</label>
        <select
          className={styles.select}
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={readonly}
        >
          <option value="solidaire">Solidaire</option>
          <option value="conjoint">Conjoint</option>
        </select>
        <div className={styles.hint}>
          {type === 'solidaire' ? 'Responsabilité solidaire — Un seul certificat' : 'Responsabilité conjointe — Certificats séparés'}
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Mode de certificat</label>
        <select
          className={styles.select}
          value={certificatMode}
          onChange={(e) => setCertificatMode(e.target.value)}
          disabled={readonly}
        >
          <option value="unique">Certificat unique (mandataire)</option>
          <option value="par_membre">Certificat par membre</option>
        </select>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Membres ({membres.length})</label>
        <div className={styles.membresList}>
          {membres.map((membre, index) => (
            <div key={index} className={styles.membre}>
              <div className={styles.membreInfo}>
                <span className={styles.membreName}>
                  {membre.name}
                  {membre.is_mandataire && <span className={styles.badge}>Mandataire</span>}
                </span>
                <span className={styles.membrePart}>
                  {membre.part_pourcent}% — {membre.montant_part.toLocaleString('fr-FR')} € HT
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className={`${styles.totalPart} ${totalPart !== 100 ? styles.error : ''}`}>
          Total : {totalPart.toFixed(2)}%
          {totalPart !== 100 && <span className={styles.errorIcon}>⚠</span>}
        </div>
      </div>

      {!readonly && (
        <button
          className={styles.saveButton}
          onClick={() => onUpdate({ type, certificat_mode: certificatMode })}
        >
          Enregistrer
        </button>
      )}
    </div>
  );
}
EOF

cat > src/components/ui/GroupementConfig.module.css << 'EOF'
.container {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-21);
}

.section {
  margin-bottom: var(--spacing-21);
}

.label {
  display: block;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-8);
}

.select {
  width: 100%;
  font-family: var(--font-body);
  font-size: 14px;
  padding: var(--spacing-13);
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
}

.hint {
  margin-top: var(--spacing-8);
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--text-secondary);
}

.membresList {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-13);
}

.membre {
  padding: var(--spacing-13);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
}

.membreInfo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.membreName {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.badge {
  margin-left: var(--spacing-8);
  padding: var(--spacing-3) var(--spacing-8);
  background: var(--gold);
  color: var(--navy);
  font-size: 11px;
  font-weight: 700;
  border-radius: var(--radius-sm);
}

.membrePart {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-secondary);
}

.totalPart {
  margin-top: var(--spacing-13);
  padding: var(--spacing-13);
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
}

.totalPart.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--error);
  color: var(--error);
}

.errorIcon {
  margin-left: var(--spacing-8);
}

.saveButton {
  width: 100%;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  padding: var(--spacing-13);
  background: var(--cyan);
  color: var(--navy);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.saveButton:hover {
  background: #00d4e6;
}

:global(.dark) .container {
  background: var(--bg-secondary-dark);
  border-color: var(--border-color-dark);
}

:global(.dark) .label {
  color: var(--text-primary-dark);
}

:global(.dark) .select {
  background: var(--bg-primary-dark);
  color: var(--text-primary-dark);
  border-color: var(--border-color-dark);
}

:global(.dark) .hint {
  color: var(--text-secondary-dark);
}

:global(.dark) .membre {
  background: var(--bg-primary-dark);
  border-color: var(--border-color-dark);
}

:global(.dark) .membreName {
  color: var(--text-primary-dark);
}

:global(.dark) .membrePart {
  color: var(--text-secondary-dark);
}

:global(.dark) .totalPart {
  background: var(--bg-tertiary-dark);
  color: var(--text-primary-dark);
}
EOF

echo "✅ Phase 8 — Composants UI créés (3/3)"
echo "Fichiers créés :"
echo "  - src/components/ui/STDocChecklist.js + .module.css"
echo "  - src/components/ui/AgrementTimeline.js + .module.css"
echo "  - src/components/ui/GroupementConfig.js + .module.css"
