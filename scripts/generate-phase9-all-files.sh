#!/bin/bash
# ══════════════════════════════════════════════════════════════
# NOMOΣ — Phase 9 : Script de génération complète
# Génère les 4 composants UI + 20 API Routes + 3 pages
# ══════════════════════════════════════════════════════════════

set -e

BASE_DIR="/home/ubuntu/nomos"
cd "$BASE_DIR"

echo "🚀 Génération des fichiers Phase 9..."

# ═══════════════════════════════════════════════════════════
# COMPOSANTS UI (4 composants)
# ═══════════════════════════════════════════════════════════

echo "📦 Création des composants UI..."

# 1. DepenseCard
cat > src/components/ui/DepenseCard.js << 'EOF'
'use client';
import { useState } from 'react';
import styles from './DepenseCard.module.css';

export default function DepenseCard({ depense, onUpdate, onDelete, onContest }) {
  const [isEditing, setIsEditing] = useState(false);

  const categories = {
    gardiennage: 'Gardiennage',
    nettoyage: 'Nettoyage',
    reparation_identifie: 'Réparation identifiée',
    reparation_non_identifie: 'Réparation non identifiée',
    eau_electricite: 'Eau & Électricité',
    vol: 'Vol',
    divers: 'Divers'
  };

  return (
    <div className={`${styles.card} ${depense.is_contested ? styles.contested : ''}`}>
      <div className={styles.header}>
        <span className={styles.date}>{new Date(depense.date_depense).toLocaleDateString('fr-FR')}</span>
        <span className={`${styles.category} ${styles[depense.categorie]}`}>
          {categories[depense.categorie]}
        </span>
      </div>
      <div className={styles.designation}>{depense.designation}</div>
      <div className={styles.amount}>{depense.montant_ht.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
      {depense.entreprise_fautive_id && (
        <div className={styles.fautive}>Entreprise fautive : LOT {depense.entreprise_fautive_id}</div>
      )}
      {depense.is_contested && (
        <div className={styles.arbitrage}>
          <span className={styles.status}>{depense.arbitrage_status === 'en_cours' ? '⏳ En cours' : '✓ Résolue'}</span>
        </div>
      )}
      <div className={styles.actions}>
        {!depense.is_contested && (
          <button onClick={() => onContest(depense.id)} className={styles.btnContest}>Contester</button>
        )}
        <button onClick={() => onDelete(depense.id)} className={styles.btnDelete}>Supprimer</button>
      </div>
    </div>
  );
}
EOF

cat > src/components/ui/DepenseCard.module.css << 'EOF'
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: var(--spacing-21);
  transition: all 0.2s;
}

.card:hover {
  border-color: var(--gold);
  box-shadow: 0 3px 13px rgba(195, 162, 39, 0.1);
}

.card.contested {
  border-left: 3px solid var(--warning);
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-13);
}

.date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: var(--text-secondary);
}

.category {
  font-size: 13px;
  padding: var(--spacing-3) var(--spacing-8);
  border-radius: 13px;
  font-weight: 600;
}

.category.gardiennage { background: rgba(0, 238, 255, 0.1); color: var(--cyan); }
.category.nettoyage { background: rgba(34, 197, 94, 0.1); color: var(--success); }
.category.reparation_identifie { background: rgba(239, 68, 68, 0.1); color: var(--error); }
.category.reparation_non_identifie { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
.category.eau_electricite { background: rgba(195, 162, 39, 0.1); color: var(--gold); }
.category.vol { background: rgba(239, 68, 68, 0.15); color: var(--error); }
.category.divers { background: rgba(148, 163, 184, 0.1); color: var(--text-secondary); }

.designation {
  font-size: 16px;
  margin-bottom: var(--spacing-8);
  color: var(--text);
}

.amount {
  font-family: 'JetBrains Mono', monospace;
  font-size: 21px;
  font-weight: 700;
  color: var(--gold);
  margin-bottom: var(--spacing-13);
}

.fautive {
  font-size: 13px;
  color: var(--error);
  margin-bottom: var(--spacing-8);
}

.arbitrage {
  background: rgba(245, 158, 11, 0.05);
  padding: var(--spacing-8);
  border-radius: 5px;
  margin-bottom: var(--spacing-13);
}

.status {
  font-size: 13px;
  font-weight: 600;
  color: var(--warning);
}

.actions {
  display: flex;
  gap: var(--spacing-8);
}

.btnContest, .btnDelete {
  padding: var(--spacing-5) var(--spacing-13);
  border: none;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btnContest {
  background: var(--warning);
  color: white;
}

.btnContest:hover {
  background: #d97706;
}

.btnDelete {
  background: var(--error);
  color: white;
}

.btnDelete:hover {
  background: #dc2626;
}
EOF

# 2. RepartitionTable
cat > src/components/ui/RepartitionTable.js << 'EOF'
'use client';
import styles from './RepartitionTable.module.css';

export default function RepartitionTable({ repartitions, onUpdate }) {
  const total = repartitions.reduce((sum, r) => sum + parseFloat(r.part_pourcent), 0);
  const isValid = Math.abs(total - 100) < 0.01;

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Entreprise / Lot</th>
            <th>Part (%)</th>
            <th>Montant dû</th>
            <th>Montant versé</th>
            <th>Solde</th>
          </tr>
        </thead>
        <tbody>
          {repartitions.map((r) => (
            <tr key={r.id}>
              <td>LOT {r.lot_id}</td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  value={r.part_pourcent}
                  onChange={(e) => onUpdate(r.id, 'part_pourcent', parseFloat(e.target.value))}
                  className={styles.input}
                />
              </td>
              <td className={styles.amount}>{r.montant_du.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
              <td className={styles.amount}>{r.montant_verse.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
              <td className={`${styles.amount} ${r.solde > 0 ? styles.positive : styles.negative}`}>
                {r.solde.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>TOTAL</td>
            <td className={`${styles.total} ${isValid ? styles.valid : styles.invalid}`}>
              {total.toFixed(2)} %
            </td>
            <td colSpan="3"></td>
          </tr>
        </tfoot>
      </table>
      {!isValid && (
        <div className={styles.warning}>⚠️ La somme des parts doit être égale à 100%</div>
      )}
    </div>
  );
}
EOF

cat > src/components/ui/RepartitionTable.module.css << 'EOF'
.container {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: var(--navy);
}

.table th {
  padding: var(--spacing-13);
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  color: var(--gold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table tbody tr {
  border-bottom: 1px solid var(--border);
  transition: background 0.2s;
}

.table tbody tr:hover {
  background: rgba(195, 162, 39, 0.03);
}

.table td {
  padding: var(--spacing-13);
  font-size: 15px;
  color: var(--text);
}

.input {
  width: 80px;
  padding: var(--spacing-5);
  border: 1px solid var(--border);
  border-radius: 5px;
  background: var(--background);
  color: var(--text);
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  text-align: right;
}

.input:focus {
  outline: none;
  border-color: var(--gold);
}

.amount {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
}

.positive {
  color: var(--success);
}

.negative {
  color: var(--error);
}

.table tfoot {
  background: var(--surface-elevated);
  font-weight: 700;
}

.total {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
}

.total.valid {
  color: var(--success);
}

.total.invalid {
  color: var(--error);
}

.warning {
  padding: var(--spacing-13);
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}
EOF

# 3. ReceptionTimeline
cat > src/components/ui/ReceptionTimeline.js << 'EOF'
'use client';
import styles from './ReceptionTimeline.module.css';

export default function ReceptionTimeline({ reception }) {
  const steps = [
    { key: 'reception', label: 'Réception', date: reception.date_reception, done: true },
    { key: 'reserves', label: 'Levée réserves', date: reception.date_levee_reserves, done: !!reception.date_levee_reserves },
    { key: 'garantie', label: 'Fin garantie parfait', date: reception.date_fin_garantie_parfait, done: false },
    { key: 'rg', label: 'Libération RG', date: reception.date_liberation_rg, done: reception.rg_liberee },
    { key: 'decennale', label: 'Fin décennale', date: reception.date_fin_decennale, done: false }
  ];

  return (
    <div className={styles.timeline}>
      {steps.map((step, idx) => (
        <div key={step.key} className={`${styles.step} ${step.done ? styles.done : ''}`}>
          <div className={styles.marker}>
            {step.done ? '✓' : idx + 1}
          </div>
          <div className={styles.content}>
            <div className={styles.label}>{step.label}</div>
            {step.date && (
              <div className={styles.date}>{new Date(step.date).toLocaleDateString('fr-FR')}</div>
            )}
          </div>
          {idx < steps.length - 1 && <div className={styles.connector}></div>}
        </div>
      ))}
    </div>
  );
}
EOF

cat > src/components/ui/ReceptionTimeline.module.css << 'EOF'
.timeline {
  display: flex;
  align-items: flex-start;
  gap: 0;
  padding: var(--spacing-21);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.marker {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--surface-elevated);
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-8);
  z-index: 2;
}

.step.done .marker {
  background: var(--gold);
  border-color: var(--gold);
  color: white;
}

.content {
  text-align: center;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: var(--spacing-3);
}

.date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text-secondary);
}

.connector {
  position: absolute;
  top: 17px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--border);
  z-index: 1;
}

.step.done .connector {
  background: var(--gold);
}
EOF

# 4. DGDSummary
cat > src/components/ui/DGDSummary.js << 'EOF'
'use client';
import styles from './DGDSummary.module.css';

export default function DGDSummary({ dgd }) {
  const lines = [
    { label: 'Total travaux HT', value: dgd.total_travaux_ht, type: 'positive' },
    { label: 'Révision de prix', value: dgd.total_revision, type: 'positive' },
    { label: 'Pénalités de retard', value: dgd.total_penalites, type: 'negative' },
    { label: 'Retenue de garantie (5%)', value: -dgd.retenue_garantie, type: 'negative', note: dgd.rg_liberee ? 'Libérée' : 'Non libérée' },
    { label: 'Avances remboursées', value: -dgd.total_avances_remboursees, type: 'negative' },
    { label: 'Solde compte prorata', value: dgd.solde_prorata, type: dgd.solde_prorata >= 0 ? 'positive' : 'negative' },
    { label: 'Exécution aux frais', value: -dgd.execution_aux_frais, type: 'negative' }
  ];

  return (
    <div className={styles.summary}>
      <div className={styles.lines}>
        {lines.map((line, idx) => (
          <div key={idx} className={styles.line}>
            <span className={styles.label}>
              {line.label}
              {line.note && <span className={styles.note}> ({line.note})</span>}
            </span>
            <span className={`${styles.value} ${styles[line.type]}`}>
              {line.value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.total}>
        <span className={styles.totalLabel}>SOLDE NET DGD</span>
        <span className={styles.totalValue}>
          {dgd.solde_net_dgd.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </span>
      </div>
    </div>
  );
}
EOF

cat > src/components/ui/DGDSummary.module.css << 'EOF'
.summary {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.lines {
  padding: var(--spacing-21);
}

.line {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-8) 0;
  border-bottom: 1px solid var(--border);
}

.line:last-child {
  border-bottom: none;
}

.label {
  font-size: 15px;
  color: var(--text);
}

.note {
  font-size: 13px;
  color: var(--text-secondary);
  font-style: italic;
}

.value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  font-weight: 600;
}

.value.positive {
  color: var(--success);
}

.value.negative {
  color: var(--error);
}

.total {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-21);
  background: var(--navy);
}

.totalLabel {
  font-size: 16px;
  font-weight: 700;
  color: var(--gold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.totalValue {
  font-family: 'JetBrains Mono', monospace;
  font-size: 21px;
  font-weight: 700;
  color: var(--gold);
}
EOF

echo "✅ 4 composants UI créés"

# ═══════════════════════════════════════════════════════════
# API ROUTES (20 routes)
# ═══════════════════════════════════════════════════════════

echo "📡 Création des API Routes..."

# Compte Prorata (8 routes)
cat > src/app/api/operations/[id]/prorata/route.js << 'EOF'
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM compte_prorata WHERE operation_id = ?',
      [id]
    );
    return NextResponse.json(rows[0] || null);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  try {
    await pool.query(
      'UPDATE compte_prorata SET mode_repartition = ?, taux_prelevement = ? WHERE operation_id = ?',
      [body.mode_repartition, body.taux_prelevement, id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
EOF

cat > src/app/api/operations/[id]/prorata/depenses/route.js << 'EOF'
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM prorata_depenses WHERE compte_prorata_id = (SELECT id FROM compte_prorata WHERE operation_id = ?) ORDER BY date_depense DESC',
      [id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { id } = params;
  const body = await request.json();
  try {
    const [compte] = await pool.query('SELECT id, tenant_id FROM compte_prorata WHERE operation_id = ?', [id]);
    const [result] = await pool.query(
      'INSERT INTO prorata_depenses (tenant_id, compte_prorata_id, date_depense, designation, categorie, montant_ht, entreprise_fautive_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [compte[0].tenant_id, compte[0].id, body.date_depense, body.designation, body.categorie, body.montant_ht, body.entreprise_fautive_id]
    );
    return NextResponse.json({ id: result.insertId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
EOF

cat > src/app/api/operations/[id]/prorata/depenses/[depenseId]/route.js << 'EOF'
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(request, { params }) {
  const { depenseId } = params;
  try {
    await pool.query('DELETE FROM prorata_depenses WHERE id = ?', [depenseId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
EOF

cat > src/app/api/operations/[id]/prorata/depenses/[depenseId]/contest/route.js << 'EOF'
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request, { params }) {
  const { depenseId } = params;
  try {
    await pool.query(
      'UPDATE prorata_depenses SET is_contested = TRUE, arbitrage_status = ? WHERE id = ?',
      ['en_cours', depenseId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
EOF

cat > src/app/api/operations/[id]/prorata/repartitions/route.js << 'EOF'
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM prorata_repartitions WHERE compte_prorata_id = (SELECT id FROM compte_prorata WHERE operation_id = ?)',
      [id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  try {
    for (const rep of body.repartitions) {
      await pool.query(
        'UPDATE prorata_repartitions SET part_pourcent = ? WHERE id = ?',
        [rep.part_pourcent, rep.id]
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
EOF

cat > src/app/api/operations/[id]/prorata/cloture/route.js << 'EOF'
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request, { params }) {
  const { id } = params;
  try {
    await pool.query(
      'UPDATE compte_prorata SET status = ? WHERE operation_id = ?',
      ['cloture', id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
EOF

# Réception (6 routes)
cat > src/app/api/operations/[id]/reception/route.js << 'EOF'
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM receptions WHERE operation_id = ? ORDER BY date_reception DESC',
      [id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { id } = params;
  const body = await request.json();
  try {
    const date_fin_garantie_parfait = new Date(body.date_reception);
    date_fin_garantie_parfait.setFullYear(date_fin_garantie_parfait.getFullYear() + 1);
    
    const date_liberation_rg = body.has_reserves && body.date_levee_reserves 
      ? new Date(body.date_levee_reserves)
      : new Date(body.date_reception);
    
    const date_fin_decennale = new Date(body.date_reception);
    date_fin_decennale.setFullYear(date_fin_decennale.getFullYear() + 10);

    const [result] = await pool.query(
      `INSERT INTO receptions (tenant_id, operation_id, lot_id, entreprise_id, type, perimetre, date_reception, has_reserves, date_levee_reserves, date_fin_garantie_parfait, date_liberation_rg, date_fin_decennale, delai_notification_retenues, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [body.tenant_id, id, body.lot_id, body.entreprise_id, body.type, body.perimetre, body.date_reception, body.has_reserves, body.date_levee_reserves, date_fin_garantie_parfait, date_liberation_rg, date_fin_decennale, 30, 'enregistree']
    );
    return NextResponse.json({ id: result.insertId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
EOF

cat > src/app/api/operations/[id]/reception/[receptionId]/route.js << 'EOF'
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { receptionId } = params;
  try {
    const [rows] = await pool.query('SELECT * FROM receptions WHERE id = ?', [receptionId]);
    return NextResponse.json(rows[0] || null);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { receptionId } = params;
  const body = await request.json();
  try {
    await pool.query(
      'UPDATE receptions SET date_levee_reserves = ?, status = ? WHERE id = ?',
      [body.date_levee_reserves, body.status, receptionId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
EOF

cat > src/app/api/operations/[id]/reception/[receptionId]/retenues/route.js << 'EOF'
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request, { params }) {
  const { receptionId } = params;
  try {
    await pool.query(
      'UPDATE receptions SET retenues_notifiees = TRUE WHERE id = ?',
      [receptionId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
EOF

cat > src/app/api/operations/[id]/reception/[receptionId]/liberer-rg/route.js << 'EOF'
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request, { params }) {
  const { receptionId } = params;
  try {
    await pool.query(
      'UPDATE receptions SET status = ? WHERE id = ?',
      ['rg_liberee', receptionId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
EOF

# DGD (6 routes)
cat > src/app/api/operations/[id]/dgd/route.js << 'EOF'
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM dgd WHERE operation_id = ? ORDER BY created_at DESC',
      [id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { id } = params;
  const body = await request.json();
  try {
    const solde_net_dgd = body.total_travaux_ht + body.total_revision + body.total_penalites - body.retenue_garantie - body.total_avances_remboursees + body.solde_prorata - body.execution_aux_frais;
    
    const [result] = await pool.query(
      `INSERT INTO dgd (tenant_id, operation_id, lot_id, entreprise_id, reception_id, total_travaux_ht, total_revision, total_penalites, retenue_garantie, total_avances_remboursees, solde_prorata, execution_aux_frais, solde_net_dgd, status, date_generation, delai_reponse_entreprise) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [body.tenant_id, id, body.lot_id, body.entreprise_id, body.reception_id, body.total_travaux_ht, body.total_revision, body.total_penalites, body.retenue_garantie, body.total_avances_remboursees, body.solde_prorata, body.execution_aux_frais, solde_net_dgd, 'genere', 30]
    );
    return NextResponse.json({ id: result.insertId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
EOF

cat > src/app/api/operations/[id]/dgd/[dgdId]/route.js << 'EOF'
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { dgdId } = params;
  try {
    const [rows] = await pool.query('SELECT * FROM dgd WHERE id = ?', [dgdId]);
    return NextResponse.json(rows[0] || null);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
EOF

cat > src/app/api/operations/[id]/dgd/[dgdId]/sign/route.js << 'EOF'
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request, { params }) {
  const { dgdId } = params;
  const body = await request.json();
  try {
    const field = `date_signature_${body.role}`;
    const newStatus = body.role === 'moa' ? 'definitif' : `signe_${body.role}`;
    
    await pool.query(
      `UPDATE dgd SET ${field} = NOW(), status = ? WHERE id = ?`,
      [newStatus, dgdId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
EOF

cat > src/app/api/operations/[id]/dgd/[dgdId]/pdf/route.js << 'EOF'
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { dgdId } = params;
  try {
    // TODO: Generate PDF
    return NextResponse.json({ pdf_url: '/placeholder-dgd.pdf' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
EOF

echo "✅ 20 API Routes créées"

# ═══════════════════════════════════════════════════════════
# PAGES (3 pages)
# ═══════════════════════════════════════════════════════════

echo "📄 Création des pages..."

# Page Compte Prorata
cat > src/app/dashboard/operations/[id]/prorata/page.js << 'EOF'
'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import DepenseCard from '@/components/ui/DepenseCard';
import RepartitionTable from '@/components/ui/RepartitionTable';
import styles from './prorata.module.css';

export default function ProrataPage({ params }) {
  const { id } = use(params);
  const [compte, setCompte] = useState(null);
  const [depenses, setDepenses] = useState([]);
  const [repartitions, setRepartitions] = useState([]);
  const [showAddDepense, setShowAddDepense] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    const [compteRes, depensesRes, repartitionsRes] = await Promise.all([
      fetch(`/api/operations/${id}/prorata`),
      fetch(`/api/operations/${id}/prorata/depenses`),
      fetch(`/api/operations/${id}/prorata/repartitions`)
    ]);
    setCompte(await compteRes.json());
    setDepenses(await depensesRes.json());
    setRepartitions(await repartitionsRes.json());
  }

  async function handleAddDepense(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    await fetch(`/api/operations/${id}/prorata/depenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData))
    });
    setShowAddDepense(false);
    fetchData();
  }

  async function handleDeleteDepense(depenseId) {
    await fetch(`/api/operations/${id}/prorata/depenses/${depenseId}`, { method: 'DELETE' });
    fetchData();
  }

  async function handleContestDepense(depenseId) {
    await fetch(`/api/operations/${id}/prorata/depenses/${depenseId}/contest`, { method: 'POST' });
    fetchData();
  }

  async function handleUpdateRepartition(repId, field, value) {
    const updated = repartitions.map(r => r.id === repId ? { ...r, [field]: value } : r);
    setRepartitions(updated);
  }

  async function handleSaveRepartitions() {
    await fetch(`/api/operations/${id}/prorata/repartitions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repartitions })
    });
    fetchData();
  }

  if (!compte) return <div>Chargement...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Compte Prorata</h1>

      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Recettes</span>
          <span className={styles.kpiValue}>{compte.total_recettes.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Dépenses</span>
          <span className={styles.kpiValue}>{compte.total_depenses.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Solde</span>
          <span className={`${styles.kpiValue} ${compte.solde >= 0 ? styles.positive : styles.negative}`}>
            {compte.solde.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Dépenses partagées</h2>
          <button onClick={() => setShowAddDepense(true)} className={styles.btnAdd}>+ Ajouter</button>
        </div>
        {showAddDepense && (
          <form onSubmit={handleAddDepense} className={styles.form}>
            <input type="date" name="date_depense" required />
            <input type="text" name="designation" placeholder="Désignation" required />
            <select name="categorie" required>
              <option value="gardiennage">Gardiennage</option>
              <option value="nettoyage">Nettoyage</option>
              <option value="reparation_identifie">Réparation identifiée</option>
              <option value="reparation_non_identifie">Réparation non identifiée</option>
              <option value="eau_electricite">Eau & Électricité</option>
              <option value="vol">Vol</option>
              <option value="divers">Divers</option>
            </select>
            <input type="number" step="0.01" name="montant_ht" placeholder="Montant HT" required />
            <button type="submit">Enregistrer</button>
            <button type="button" onClick={() => setShowAddDepense(false)}>Annuler</button>
          </form>
        )}
        <div className={styles.depensesList}>
          {depenses.map(d => (
            <DepenseCard
              key={d.id}
              depense={d}
              onDelete={handleDeleteDepense}
              onContest={handleContestDepense}
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Répartition des charges</h2>
          <button onClick={handleSaveRepartitions} className={styles.btnSave}>Enregistrer</button>
        </div>
        <RepartitionTable repartitions={repartitions} onUpdate={handleUpdateRepartition} />
      </section>
    </div>
  );
}
EOF

cat > src/app/dashboard/operations/[id]/prorata/prorata.module.css << 'EOF'
.container {
  padding: var(--spacing-34);
  max-width: 1400px;
  margin: 0 auto;
}

.title {
  font-family: 'Chivel', serif;
  font-size: 34px;
  color: var(--gold);
  margin-bottom: var(--spacing-34);
}

.kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-21);
  margin-bottom: var(--spacing-34);
}

.kpi {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: var(--spacing-21);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.kpiLabel {
  font-size: 13px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpiValue {
  font-family: 'JetBrains Mono', monospace;
  font-size: 21px;
  font-weight: 700;
  color: var(--gold);
}

.kpiValue.positive {
  color: var(--success);
}

.kpiValue.negative {
  color: var(--error);
}

.section {
  margin-bottom: var(--spacing-34);
}

.sectionHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-21);
}

.sectionHeader h2 {
  font-size: 21px;
  color: var(--text);
}

.btnAdd, .btnSave {
  padding: var(--spacing-8) var(--spacing-21);
  background: var(--gold);
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btnAdd:hover, .btnSave:hover {
  background: #a68820;
}

.form {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: var(--spacing-21);
  display: flex;
  gap: var(--spacing-13);
  margin-bottom: var(--spacing-21);
}

.form input, .form select {
  padding: var(--spacing-8);
  border: 1px solid var(--border);
  border-radius: 5px;
  background: var(--background);
  color: var(--text);
  font-size: 14px;
}

.form button {
  padding: var(--spacing-8) var(--spacing-13);
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
}

.form button[type="submit"] {
  background: var(--gold);
  color: white;
}

.form button[type="button"] {
  background: var(--error);
  color: white;
}

.depensesList {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-21);
}
EOF

# Page Réception
cat > src/app/dashboard/operations/[id]/reception/page.js << 'EOF'
'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import ReceptionTimeline from '@/components/ui/ReceptionTimeline';
import styles from './reception.module.css';

export default function ReceptionPage({ params }) {
  const { id } = use(params);
  const [receptions, setReceptions] = useState([]);
  const [showAddReception, setShowAddReception] = useState(false);

  useEffect(() => {
    fetchReceptions();
  }, [id]);

  async function fetchReceptions() {
    const res = await fetch(`/api/operations/${id}/reception`);
    setReceptions(await res.json());
  }

  async function handleAddReception(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    await fetch(`/api/operations/${id}/reception`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: 1,
        ...Object.fromEntries(formData),
        has_reserves: formData.get('has_reserves') === 'on'
      })
    });
    setShowAddReception(false);
    fetchReceptions();
  }

  async function handleNotifierRetenues(receptionId) {
    await fetch(`/api/operations/${id}/reception/${receptionId}/retenues`, { method: 'POST' });
    fetchReceptions();
  }

  async function handleLibererRG(receptionId) {
    await fetch(`/api/operations/${id}/reception/${receptionId}/liberer-rg`, { method: 'POST' });
    fetchReceptions();
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Réceptions & Clôture</h1>

      <div className={styles.header}>
        <button onClick={() => setShowAddReception(true)} className={styles.btnAdd}>+ Enregistrer une réception</button>
      </div>

      {showAddReception && (
        <form onSubmit={handleAddReception} className={styles.form}>
          <select name="lot_id" required>
            <option value="">Sélectionner un lot</option>
            <option value="1">LOT 01</option>
            <option value="2">LOT 02</option>
          </select>
          <select name="entreprise_id" required>
            <option value="">Sélectionner une entreprise</option>
            <option value="1">Entreprise 1</option>
            <option value="2">Entreprise 2</option>
          </select>
          <select name="type" required>
            <option value="totale">Totale</option>
            <option value="partielle">Partielle</option>
          </select>
          <input type="date" name="date_reception" required />
          <label>
            <input type="checkbox" name="has_reserves" />
            Avec réserves
          </label>
          <button type="submit">Enregistrer</button>
          <button type="button" onClick={() => setShowAddReception(false)}>Annuler</button>
        </form>
      )}

      <div className={styles.receptionsList}>
        {receptions.map(r => (
          <div key={r.id} className={styles.receptionCard}>
            <div className={styles.cardHeader}>
              <span className={styles.lot}>LOT {r.lot_id}</span>
              <span className={`${styles.status} ${styles[r.status]}`}>{r.status}</span>
            </div>
            <ReceptionTimeline reception={r} />
            <div className={styles.actions}>
              {!r.retenues_notifiees && (
                <button onClick={() => handleNotifierRetenues(r.id)} className={styles.btnAction}>
                  Notifier retenues
                </button>
              )}
              {r.status === 'reserves_levees' && !r.rg_liberee && (
                <button onClick={() => handleLibererRG(r.id)} className={styles.btnAction}>
                  Libérer RG
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
EOF

cat > src/app/dashboard/operations/[id]/reception/reception.module.css << 'EOF'
.container {
  padding: var(--spacing-34);
  max-width: 1400px;
  margin: 0 auto;
}

.title {
  font-family: 'Chivel', serif;
  font-size: 34px;
  color: var(--gold);
  margin-bottom: var(--spacing-34);
}

.header {
  margin-bottom: var(--spacing-21);
}

.btnAdd {
  padding: var(--spacing-8) var(--spacing-21);
  background: var(--gold);
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btnAdd:hover {
  background: #a68820;
}

.form {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: var(--spacing-21);
  display: flex;
  gap: var(--spacing-13);
  margin-bottom: var(--spacing-21);
}

.form input, .form select {
  padding: var(--spacing-8);
  border: 1px solid var(--border);
  border-radius: 5px;
  background: var(--background);
  color: var(--text);
  font-size: 14px;
}

.form button {
  padding: var(--spacing-8) var(--spacing-13);
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
}

.form button[type="submit"] {
  background: var(--gold);
  color: white;
}

.form button[type="button"] {
  background: var(--error);
  color: white;
}

.receptionsList {
  display: grid;
  gap: var(--spacing-21);
}

.receptionCard {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: var(--spacing-21);
}

.cardHeader {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-21);
}

.lot {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  font-weight: 700;
  color: var(--gold);
}

.status {
  font-size: 13px;
  padding: var(--spacing-3) var(--spacing-8);
  border-radius: 13px;
  font-weight: 600;
}

.status.enregistree { background: rgba(0, 238, 255, 0.1); color: var(--cyan); }
.status.reserves_levees { background: rgba(34, 197, 94, 0.1); color: var(--success); }
.status.rg_liberee { background: rgba(195, 162, 39, 0.1); color: var(--gold); }

.actions {
  display: flex;
  gap: var(--spacing-8);
  margin-top: var(--spacing-21);
}

.btnAction {
  padding: var(--spacing-5) var(--spacing-13);
  background: var(--gold);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btnAction:hover {
  background: #a68820;
}
EOF

# Page DGD
cat > src/app/dashboard/operations/[id]/dgd/page.js << 'EOF'
'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import DGDSummary from '@/components/ui/DGDSummary';
import styles from './dgd.module.css';

export default function DGDPage({ params }) {
  const { id } = use(params);
  const [dgds, setDgds] = useState([]);
  const [showGenerate, setShowGenerate] = useState(false);

  useEffect(() => {
    fetchDGDs();
  }, [id]);

  async function fetchDGDs() {
    const res = await fetch(`/api/operations/${id}/dgd`);
    setDgds(await res.json());
  }

  async function handleGenerateDGD(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    await fetch(`/api/operations/${id}/dgd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: 1,
        ...Object.fromEntries(formData)
      })
    });
    setShowGenerate(false);
    fetchDGDs();
  }

  async function handleSign(dgdId, role) {
    await fetch(`/api/operations/${id}/dgd/${dgdId}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    fetchDGDs();
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Décompte Général Définitif (DGD)</h1>

      <div className={styles.header}>
        <button onClick={() => setShowGenerate(true)} className={styles.btnAdd}>+ Générer un DGD</button>
      </div>

      {showGenerate && (
        <form onSubmit={handleGenerateDGD} className={styles.form}>
          <input type="number" name="lot_id" placeholder="Lot ID" required />
          <input type="number" name="entreprise_id" placeholder="Entreprise ID" required />
          <input type="number" name="reception_id" placeholder="Réception ID" required />
          <input type="number" step="0.01" name="total_travaux_ht" placeholder="Total travaux HT" required />
          <input type="number" step="0.01" name="total_revision" placeholder="Révision" defaultValue="0" />
          <input type="number" step="0.01" name="total_penalites" placeholder="Pénalités" defaultValue="0" />
          <input type="number" step="0.01" name="retenue_garantie" placeholder="RG (5%)" required />
          <input type="number" step="0.01" name="total_avances_remboursees" placeholder="Avances remboursées" defaultValue="0" />
          <input type="number" step="0.01" name="solde_prorata" placeholder="Solde prorata" defaultValue="0" />
          <input type="number" step="0.01" name="execution_aux_frais" placeholder="Exécution aux frais" defaultValue="0" />
          <button type="submit">Générer</button>
          <button type="button" onClick={() => setShowGenerate(false)}>Annuler</button>
        </form>
      )}

      <div className={styles.dgdsList}>
        {dgds.map(dgd => (
          <div key={dgd.id} className={styles.dgdCard}>
            <div className={styles.cardHeader}>
              <span className={styles.lot}>LOT {dgd.lot_id}</span>
              <span className={`${styles.status} ${styles[dgd.status]}`}>{dgd.status}</span>
            </div>
            <DGDSummary dgd={dgd} />
            <div className={styles.signatures}>
              <div className={styles.signature}>
                <span>Entreprise</span>
                {dgd.date_signature_entreprise ? (
                  <span className={styles.signed}>✓ Signé</span>
                ) : (
                  <button onClick={() => handleSign(dgd.id, 'entreprise')} className={styles.btnSign}>Signer</button>
                )}
              </div>
              <div className={styles.signature}>
                <span>MOE</span>
                {dgd.date_signature_moe ? (
                  <span className={styles.signed}>✓ Signé</span>
                ) : (
                  <button onClick={() => handleSign(dgd.id, 'moe')} className={styles.btnSign}>Signer</button>
                )}
              </div>
              <div className={styles.signature}>
                <span>MOA</span>
                {dgd.date_signature_moa ? (
                  <span className={styles.signed}>✓ Signé</span>
                ) : (
                  <button onClick={() => handleSign(dgd.id, 'moa')} className={styles.btnSign}>Signer</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
EOF

cat > src/app/dashboard/operations/[id]/dgd/dgd.module.css << 'EOF'
.container {
  padding: var(--spacing-34);
  max-width: 1400px;
  margin: 0 auto;
}

.title {
  font-family: 'Chivel', serif;
  font-size: 34px;
  color: var(--gold);
  margin-bottom: var(--spacing-34);
}

.header {
  margin-bottom: var(--spacing-21);
}

.btnAdd {
  padding: var(--spacing-8) var(--spacing-21);
  background: var(--gold);
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btnAdd:hover {
  background: #a68820;
}

.form {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: var(--spacing-21);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-13);
  margin-bottom: var(--spacing-21);
}

.form input {
  padding: var(--spacing-8);
  border: 1px solid var(--border);
  border-radius: 5px;
  background: var(--background);
  color: var(--text);
  font-size: 14px;
}

.form button {
  grid-column: span 3;
  padding: var(--spacing-8) var(--spacing-13);
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
}

.form button[type="submit"] {
  background: var(--gold);
  color: white;
}

.form button[type="button"] {
  background: var(--error);
  color: white;
}

.dgdsList {
  display: grid;
  gap: var(--spacing-21);
}

.dgdCard {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: var(--spacing-21);
}

.cardHeader {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-21);
}

.lot {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  font-weight: 700;
  color: var(--gold);
}

.status {
  font-size: 13px;
  padding: var(--spacing-3) var(--spacing-8);
  border-radius: 13px;
  font-weight: 600;
}

.status.genere { background: rgba(0, 238, 255, 0.1); color: var(--cyan); }
.status.signe_entreprise { background: rgba(195, 162, 39, 0.1); color: var(--gold); }
.status.signe_moe { background: rgba(195, 162, 39, 0.15); color: var(--gold); }
.status.definitif { background: rgba(34, 197, 94, 0.1); color: var(--success); }

.signatures {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-13);
  margin-top: var(--spacing-21);
  padding-top: var(--spacing-21);
  border-top: 1px solid var(--border);
}

.signature {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  align-items: center;
}

.signature span:first-child {
  font-size: 13px;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.signed {
  color: var(--success);
  font-weight: 600;
}

.btnSign {
  padding: var(--spacing-5) var(--spacing-13);
  background: var(--gold);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btnSign:hover {
  background: #a68820;
}
EOF

echo "✅ 3 pages créées"

echo "🎉 Phase 9 complète : 4 composants UI + 20 API Routes + 3 pages"
