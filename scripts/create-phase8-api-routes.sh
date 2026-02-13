#!/bin/bash

# ══════════════════════════════════════════════════════════════
# NOMOΣ — Phase 8 : API Routes Generator
# Génère toutes les API Routes (10 ST + 5 Groupements = 15 routes)
# ══════════════════════════════════════════════════════════════

cd /home/ubuntu/nomos

# Créer les répertoires nécessaires
mkdir -p src/app/api/operations/[id]/sous-traitants/[stId]/{documents,paiements}
mkdir -p src/app/api/operations/[id]/groupements/[groupementId]/membres

# ═══════════════════════════════════════════════════════════
# SOUS-TRAITANTS API ROUTES (10 routes)
# ═══════════════════════════════════════════════════════════

# 1. GET/POST sous-traitants list
cat > src/app/api/operations/[id]/sous-traitants/route.js << 'EOFAPI'
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: operationId } = params;

    const soustraitants = await query(
      `SELECT st.*, e.name as entreprise_titulaire_name, l.name as lot_name
       FROM sous_traitants st
       JOIN entreprises e ON st.entreprise_titulaire_id = e.id
       JOIN lots l ON st.lot_id = l.id
       WHERE st.tenant_id = ? AND st.operation_id = ?
       ORDER BY st.created_at DESC`,
      [user.tenant_id, operationId]
    );

    return NextResponse.json({ soustraitants });
  } catch (error) {
    console.error('GET /api/operations/[id]/sous-traitants error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: operationId } = params;
    const body = await request.json();

    const result = await query(
      `INSERT INTO sous_traitants (
        tenant_id, operation_id, lot_id, entreprise_titulaire_id,
        name, siret, contact_name, contact_email, contact_phone,
        montant_ht, perimetre, paiement_mode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.tenant_id,
        operationId,
        body.lot_id,
        body.entreprise_titulaire_id,
        body.name,
        body.siret,
        body.contact_name,
        body.contact_email,
        body.contact_phone,
        body.montant_ht,
        body.perimetre,
        body.paiement_mode || 'direct'
      ]
    );

    return NextResponse.json({ id: result.insertId, message: 'Sous-traitant créé' });
  } catch (error) {
    console.error('POST /api/operations/[id]/sous-traitants error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
EOFAPI

# 2. GET/PUT/DELETE sous-traitant detail
cat > src/app/api/operations/[id]/sous-traitants/[stId]/route.js << 'EOFAPI'
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { stId } = params;

    const [st] = await query(
      `SELECT st.*, e.name as entreprise_titulaire_name, l.name as lot_name
       FROM sous_traitants st
       JOIN entreprises e ON st.entreprise_titulaire_id = e.id
       JOIN lots l ON st.lot_id = l.id
       WHERE st.tenant_id = ? AND st.id = ?`,
      [user.tenant_id, stId]
    );

    if (!st) {
      return NextResponse.json({ error: 'Sous-traitant introuvable' }, { status: 404 });
    }

    return NextResponse.json({ soustraitant: st });
  } catch (error) {
    console.error('GET /api/operations/[id]/sous-traitants/[stId] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { stId } = params;
    const body = await request.json();

    await query(
      `UPDATE sous_traitants SET
        name = ?, siret = ?, contact_name = ?, contact_email = ?, contact_phone = ?,
        montant_ht = ?, perimetre = ?, paiement_mode = ?
       WHERE tenant_id = ? AND id = ?`,
      [
        body.name,
        body.siret,
        body.contact_name,
        body.contact_email,
        body.contact_phone,
        body.montant_ht,
        body.perimetre,
        body.paiement_mode,
        user.tenant_id,
        stId
      ]
    );

    return NextResponse.json({ message: 'Sous-traitant mis à jour' });
  } catch (error) {
    console.error('PUT /api/operations/[id]/sous-traitants/[stId] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { stId } = params;

    await query(
      'DELETE FROM sous_traitants WHERE tenant_id = ? AND id = ?',
      [user.tenant_id, stId]
    );

    return NextResponse.json({ message: 'Sous-traitant supprimé' });
  } catch (error) {
    console.error('DELETE /api/operations/[id]/sous-traitants/[stId] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
EOFAPI

# 3-10. Créer les 8 autres routes ST (documents, agrement, paiements)
cat > src/app/api/operations/[id]/sous-traitants/[stId]/documents/route.js << 'EOFAPI'
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { stId } = params;
    const docs = await query(
      'SELECT * FROM st_documents WHERE tenant_id = ? AND sous_traitant_id = ? ORDER BY type',
      [user.tenant_id, stId]
    );

    return NextResponse.json({ documents: docs });
  } catch (error) {
    console.error('GET /api/operations/[id]/sous-traitants/[stId]/documents error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { stId } = params;
    const body = await request.json();

    const result = await query(
      'INSERT INTO st_documents (tenant_id, sous_traitant_id, type, file_path, expires_at) VALUES (?, ?, ?, ?, ?)',
      [user.tenant_id, stId, body.type, body.file_path, body.expires_at || null]
    );

    return NextResponse.json({ id: result.insertId, message: 'Document ajouté' });
  } catch (error) {
    console.error('POST /api/operations/[id]/sous-traitants/[stId]/documents error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
EOFAPI

cat > src/app/api/operations/[id]/sous-traitants/[stId]/agrement/route.js << 'EOFAPI'
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { stId } = params;
    const body = await request.json();

    let newStatus = body.action === 'soumettre_moe' ? 'soumis_moe' :
                    body.action === 'valider_moe' ? 'valide_moe' :
                    body.action === 'soumettre_moa' ? 'soumis_moa' :
                    body.action === 'agreer' ? 'agree' :
                    body.action === 'refuser' ? 'refuse' : null;

    if (!newStatus) {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
    }

    const dateField = newStatus === 'soumis_moe' ? 'date_soumission' :
                      newStatus === 'valide_moe' ? 'date_agrement_moe' :
                      newStatus === 'agree' ? 'date_agrement_moa' : null;

    let updateQuery = 'UPDATE sous_traitants SET agrement_status = ?';
    let updateParams = [newStatus];

    if (dateField) {
      updateQuery += `, ${dateField} = CURDATE()`;
    }

    if (newStatus === 'refuse') {
      updateQuery += ', agrement_refus_motif = ?';
      updateParams.push(body.motif || '');
    }

    updateQuery += ' WHERE tenant_id = ? AND id = ?';
    updateParams.push(user.tenant_id, stId);

    await query(updateQuery, updateParams);

    return NextResponse.json({ message: 'Statut agrément mis à jour' });
  } catch (error) {
    console.error('POST /api/operations/[id]/sous-traitants/[stId]/agrement error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
EOFAPI

cat > src/app/api/operations/[id]/sous-traitants/[stId]/paiements/route.js << 'EOFAPI'
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { stId } = params;
    const paiements = await query(
      'SELECT * FROM st_paiements WHERE tenant_id = ? AND sous_traitant_id = ? ORDER BY created_at DESC',
      [user.tenant_id, stId]
    );

    return NextResponse.json({ paiements });
  } catch (error) {
    console.error('GET /api/operations/[id]/sous-traitants/[stId]/paiements error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { stId } = params;
    const body = await request.json();

    const result = await query(
      'INSERT INTO st_paiements (tenant_id, sous_traitant_id, certificat_id, montant_ht, montant_cumul, paiement_direct) VALUES (?, ?, ?, ?, ?, ?)',
      [user.tenant_id, stId, body.certificat_id, body.montant_ht, body.montant_cumul, body.paiement_direct]
    );

    await query(
      'UPDATE sous_traitants SET cumul_paye = ? WHERE tenant_id = ? AND id = ?',
      [body.montant_cumul, user.tenant_id, stId]
    );

    return NextResponse.json({ id: result.insertId, message: 'Paiement enregistré' });
  } catch (error) {
    console.error('POST /api/operations/[id]/sous-traitants/[stId]/paiements error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
EOFAPI

# ═══════════════════════════════════════════════════════════
# GROUPEMENTS API ROUTES (5 routes)
# ═══════════════════════════════════════════════════════════

cat > src/app/api/operations/[id]/groupements/route.js << 'EOFAPI'
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { id: operationId } = params;

    const groupements = await query(
      `SELECT g.*, e.name as mandataire_name, l.name as lot_name
       FROM groupements g
       JOIN entreprises e ON g.mandataire_id = e.id
       JOIN lots l ON g.lot_id = l.id
       WHERE g.tenant_id = ? AND g.operation_id = ?
       ORDER BY g.created_at DESC`,
      [user.tenant_id, operationId]
    );

    return NextResponse.json({ groupements });
  } catch (error) {
    console.error('GET /api/operations/[id]/groupements error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { id: operationId } = params;
    const body = await request.json();

    const result = await query(
      'INSERT INTO groupements (tenant_id, operation_id, lot_id, type, mandataire_id, mandataire_solidaire, certificat_mode) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user.tenant_id, operationId, body.lot_id, body.type, body.mandataire_id, body.mandataire_solidaire, body.certificat_mode]
    );

    return NextResponse.json({ id: result.insertId, message: 'Groupement créé' });
  } catch (error) {
    console.error('POST /api/operations/[id]/groupements error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
EOFAPI

cat > src/app/api/operations/[id]/groupements/[groupementId]/route.js << 'EOFAPI'
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { groupementId } = params;

    const [groupement] = await query(
      'SELECT * FROM groupements WHERE tenant_id = ? AND id = ?',
      [user.tenant_id, groupementId]
    );

    if (!groupement) {
      return NextResponse.json({ error: 'Groupement introuvable' }, { status: 404 });
    }

    const membres = await query(
      `SELECT gm.*, e.name
       FROM groupement_membres gm
       JOIN entreprises e ON gm.entreprise_id = e.id
       WHERE gm.tenant_id = ? AND gm.groupement_id = ?
       ORDER BY gm.is_mandataire DESC, gm.part_pourcent DESC`,
      [user.tenant_id, groupementId]
    );

    return NextResponse.json({ groupement, membres });
  } catch (error) {
    console.error('GET /api/operations/[id]/groupements/[groupementId] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { groupementId } = params;
    const body = await request.json();

    await query(
      'UPDATE groupements SET type = ?, mandataire_solidaire = ?, certificat_mode = ? WHERE tenant_id = ? AND id = ?',
      [body.type, body.mandataire_solidaire, body.certificat_mode, user.tenant_id, groupementId]
    );

    return NextResponse.json({ message: 'Groupement mis à jour' });
  } catch (error) {
    console.error('PUT /api/operations/[id]/groupements/[groupementId] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { groupementId } = params;

    await query('DELETE FROM groupements WHERE tenant_id = ? AND id = ?', [user.tenant_id, groupementId]);

    return NextResponse.json({ message: 'Groupement supprimé' });
  } catch (error) {
    console.error('DELETE /api/operations/[id]/groupements/[groupementId] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
EOFAPI

cat > src/app/api/operations/[id]/groupements/[groupementId]/membres/route.js << 'EOFAPI'
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { groupementId } = params;
    const body = await request.json();

    const result = await query(
      'INSERT INTO groupement_membres (tenant_id, groupement_id, entreprise_id, is_mandataire, part_pourcent, montant_part) VALUES (?, ?, ?, ?, ?, ?)',
      [user.tenant_id, groupementId, body.entreprise_id, body.is_mandataire, body.part_pourcent, body.montant_part]
    );

    return NextResponse.json({ id: result.insertId, message: 'Membre ajouté' });
  } catch (error) {
    console.error('POST /api/operations/[id]/groupements/[groupementId]/membres error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
EOFAPI

echo "✅ Phase 8 — API Routes créées (15/15)"
echo "Fichiers créés :"
echo "  - 10 routes Sous-traitants"
echo "  - 5 routes Groupements"
