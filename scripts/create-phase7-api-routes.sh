#!/bin/bash

# NOMOΣ — Phase 7: Script de création des API Routes
# Ce script crée les 11 API Routes pour Avances + Pénalités

cd /home/ubuntu/nomos

# API Route 1: GET/POST avances
cat > src/app/api/operations/[id]/avances/route.js << 'EOF'
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();
    const [avances] = await pool.query(
      `SELECT a.*, l.name as lot_name, l.montant_ht 
       FROM avances a
       JOIN lots l ON a.lot_id = l.id
       WHERE a.operation_id = ? AND a.tenant_id = ?`,
      [params.id, token.tenant_id]
    );

    return NextResponse.json({ avances });
  } catch (error) {
    console.error('Error fetching avances:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const pool = await getPool();

    const [result] = await pool.query(
      `INSERT INTO avances (tenant_id, operation_id, lot_id, type, taux, base_calcul, montant_avance, seuil_debut_remb, seuil_fin_remb)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [token.tenant_id, params.id, body.lot_id, body.type || 'forfaitaire', body.taux, body.base_calcul, body.montant_avance, body.seuil_debut_remb, body.seuil_fin_remb]
    );

    return NextResponse.json({ id: result.insertId, message: 'Avance créée' });
  } catch (error) {
    console.error('Error creating avance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
EOF

# API Route 2: GET/PUT avance par lot
cat > src/app/api/operations/[id]/avances/[lotId]/route.js << 'EOF'
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();
    const [avances] = await pool.query(
      `SELECT * FROM avances WHERE operation_id = ? AND lot_id = ? AND tenant_id = ?`,
      [params.id, params.lotId, token.tenant_id]
    );

    return NextResponse.json({ avance: avances[0] || null });
  } catch (error) {
    console.error('Error fetching avance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const pool = await getPool();

    await pool.query(
      `UPDATE avances SET taux = ?, base_calcul = ?, montant_avance = ?, seuil_debut_remb = ?, seuil_fin_remb = ?, updated_at = NOW()
       WHERE operation_id = ? AND lot_id = ? AND tenant_id = ?`,
      [body.taux, body.base_calcul, body.montant_avance, body.seuil_debut_remb, body.seuil_fin_remb, params.id, params.lotId, token.tenant_id]
    );

    return NextResponse.json({ message: 'Avance mise à jour' });
  } catch (error) {
    console.error('Error updating avance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
EOF

# API Route 3: POST verser avance
cat > src/app/api/operations/[id]/avances/[lotId]/verser/route.js << 'EOF'
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const pool = await getPool();

    await pool.query(
      `UPDATE avances SET status = 'versee', date_versement = ?, updated_at = NOW()
       WHERE operation_id = ? AND lot_id = ? AND tenant_id = ?`,
      [body.date_versement || new Date(), params.id, params.lotId, token.tenant_id]
    );

    return NextResponse.json({ message: 'Avance marquée comme versée' });
  } catch (error) {
    console.error('Error marking avance as versee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
EOF

# API Route 4: GET historique remboursements
cat > src/app/api/operations/[id]/avances/[lotId]/historique/route.js << 'EOF'
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();
    const [remboursements] = await pool.query(
      `SELECT ar.*, s.numero as situation_numero, s.date_depot
       FROM avance_remboursements ar
       JOIN situations s ON ar.situation_id = s.id
       WHERE ar.avance_id IN (SELECT id FROM avances WHERE operation_id = ? AND lot_id = ? AND tenant_id = ?)
       ORDER BY s.date_depot ASC`,
      [params.id, params.lotId, token.tenant_id]
    );

    return NextResponse.json({ remboursements });
  } catch (error) {
    console.error('Error fetching remboursements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
EOF

# API Route 5: GET/POST approvisionnements
cat > src/app/api/operations/[id]/approvisionnements/[lotId]/route.js << 'EOF'
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();
    const [appros] = await pool.query(
      `SELECT * FROM approvisionnements WHERE operation_id = ? AND lot_id = ? AND tenant_id = ? ORDER BY date_depot DESC`,
      [params.id, params.lotId, token.tenant_id]
    );

    return NextResponse.json({ approvisionnements: appros });
  } catch (error) {
    console.error('Error fetching approvisionnements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const pool = await getPool();

    const [result] = await pool.query(
      `INSERT INTO approvisionnements (tenant_id, operation_id, lot_id, designation, montant_ht, date_depot, date_livraison_prevue, taux_avance)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [token.tenant_id, params.id, params.lotId, body.designation, body.montant_ht, body.date_depot, body.date_livraison_prevue, body.taux_avance || 95]
    );

    return NextResponse.json({ id: result.insertId, message: 'Approvisionnement créé' });
  } catch (error) {
    console.error('Error creating approvisionnement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
EOF

# API Route 6: PUT/DELETE approvisionnement
cat > src/app/api/operations/[id]/approvisionnements/[lotId]/[approId]/route.js << 'EOF'
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const pool = await getPool();

    await pool.query(
      `UPDATE approvisionnements SET designation = ?, montant_ht = ?, date_livraison_prevue = ?, taux_avance = ?, updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [body.designation, body.montant_ht, body.date_livraison_prevue, body.taux_avance, params.approId, token.tenant_id]
    );

    return NextResponse.json({ message: 'Approvisionnement mis à jour' });
  } catch (error) {
    console.error('Error updating approvisionnement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();
    await pool.query(
      `DELETE FROM approvisionnements WHERE id = ? AND tenant_id = ?`,
      [params.approId, token.tenant_id]
    );

    return NextResponse.json({ message: 'Approvisionnement supprimé' });
  } catch (error) {
    console.error('Error deleting approvisionnement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
EOF

# API Route 7: GET/POST barèmes pénalités
cat > src/app/api/operations/[id]/penalite-baremes/route.js << 'EOF'
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();
    const [baremes] = await pool.query(
      `SELECT * FROM penalite_baremes WHERE operation_id = ? AND tenant_id = ? ORDER BY type, name`,
      [params.id, token.tenant_id]
    );

    return NextResponse.json({ baremes });
  } catch (error) {
    console.error('Error fetching baremes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const pool = await getPool();

    const [result] = await pool.query(
      `INSERT INTO penalite_baremes (tenant_id, operation_id, name, type, mode_calcul, taux_jour, montant_forfait, seuil_jours, plafond_pourcent, exoneration_jours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [token.tenant_id, params.id, body.name, body.type, body.mode_calcul, body.taux_jour, body.montant_forfait, body.seuil_jours, body.plafond_pourcent, body.exoneration_jours]
    );

    return NextResponse.json({ id: result.insertId, message: 'Barème créé' });
  } catch (error) {
    console.error('Error creating bareme:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
EOF

# API Route 8: PUT/DELETE barème
cat > src/app/api/operations/[id]/penalite-baremes/[baremeId]/route.js << 'EOF'
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const pool = await getPool();

    await pool.query(
      `UPDATE penalite_baremes SET name = ?, type = ?, mode_calcul = ?, taux_jour = ?, montant_forfait = ?, seuil_jours = ?, plafond_pourcent = ?, exoneration_jours = ?, updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [body.name, body.type, body.mode_calcul, body.taux_jour, body.montant_forfait, body.seuil_jours, body.plafond_pourcent, body.exoneration_jours, params.baremeId, token.tenant_id]
    );

    return NextResponse.json({ message: 'Barème mis à jour' });
  } catch (error) {
    console.error('Error updating bareme:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();
    await pool.query(
      `DELETE FROM penalite_baremes WHERE id = ? AND tenant_id = ?`,
      [params.baremeId, token.tenant_id]
    );

    return NextResponse.json({ message: 'Barème supprimé' });
  } catch (error) {
    console.error('Error deleting bareme:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
EOF

# API Route 9: GET plafond pénalité
cat > src/app/api/penalites/[id]/plafond/route.js << 'EOF'
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { checkPlafond } from '@/lib/penalite-engine';

export async function GET(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();
    const [penalites] = await pool.query(
      `SELECT p.*, l.montant_ht as montant_marche
       FROM penalites p
       JOIN lots l ON p.lot_id = l.id
       WHERE p.id = ? AND p.tenant_id = ?`,
      [params.id, token.tenant_id]
    );

    if (penalites.length === 0) {
      return NextResponse.json({ error: 'Pénalité not found' }, { status: 404 });
    }

    const penalite = penalites[0];
    const plafondInfo = checkPlafond(penalite.cumul_penalites, penalite.montant_marche, penalite.plafond_pourcent);

    return NextResponse.json({ plafond: plafondInfo });
  } catch (error) {
    console.error('Error checking plafond:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
EOF

# API Route 10: POST exonérer pénalité
cat > src/app/api/penalites/[id]/exonerer/route.js << 'EOF'
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const pool = await getPool();

    await pool.query(
      `UPDATE penalites SET exoneration = TRUE, exoneration_motif = ?, exoneration_date = NOW(), updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [body.motif, params.id, token.tenant_id]
    );

    return NextResponse.json({ message: 'Pénalité exonérée' });
  } catch (error) {
    console.error('Error exonerating penalite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
EOF

echo "✅ 11 API Routes Phase 7 créées avec succès"
EOF

chmod +x /home/ubuntu/nomos/scripts/create-phase7-api-routes.sh
