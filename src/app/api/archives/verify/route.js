/**
 * NOMOΣ — Archive Integrity Verification API
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { verifyArchiveIntegrity } from '@/lib/archive-engine';

/**
 * POST /api/archives/verify
 * Verify archive integrity by recalculating hash
 */
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const body = await request.json();
    const { archive_id } = body;
    
    if (!archive_id) {
      return NextResponse.json(
        { error: 'archive_id requis' },
        { status: 400 }
      );
    }
    
    const isValid = await verifyArchiveIntegrity(archive_id);
    
    return NextResponse.json({
      success: true,
      valid: isValid,
      message: isValid 
        ? 'Intégrité vérifiée avec succès'
        : 'ALERTE: Intégrité compromise - hash ne correspond pas'
    });
    
  } catch (error) {
    console.error('Archive verification error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
