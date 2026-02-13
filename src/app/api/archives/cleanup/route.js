/**
 * NOMOΣ — Archive Cleanup API
 * Cleanup expired archives (admin only)
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/withAuth';
import { cleanupExpiredArchives } from '@/lib/archive-engine';

/**
 * POST /api/archives/cleanup
 * Cleanup expired archives (admin only)
 */
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Admin only
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    
    const cleanedCount = await cleanupExpiredArchives();
    
    return NextResponse.json({
      success: true,
      cleaned_count: cleanedCount,
      message: `${cleanedCount} archive(s) expirée(s) nettoyée(s)`
    });
    
  } catch (error) {
    console.error('Archive cleanup error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du nettoyage' },
      { status: 500 }
    );
  }
}
