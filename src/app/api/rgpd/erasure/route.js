/**
 * NOMOΣ — RGPD Erasure API
 * Erase user data (Article 17 - Right to erasure)
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { eraseUserData } from '@/lib/rgpd';

/**
 * POST /api/rgpd/erasure
 * Erase user data (admin processing)
 * IMPORTANT: Financial documents retained for 10 years (legal obligation)
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
    
    const body = await request.json();
    const { request_id } = body;
    
    if (!request_id) {
      return NextResponse.json({ error: 'request_id requis' }, { status: 400 });
    }
    
    // Get request details
    const pool = require('@/lib/db').default;
    const conn = await pool.getConnection();
    
    try {
      const [requests] = await conn.query(
        'SELECT * FROM rgpd_requests WHERE id = ?',
        [request_id]
      );
      
      if (requests.length === 0) {
        return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 });
      }
      
      const rgpdRequest = requests[0];
      
      // Erase user data
      await eraseUserData(rgpdRequest.user_id, request_id, user.id);
      
      return NextResponse.json({
        success: true,
        message: 'Données personnelles anonymisées. Documents financiers conservés (obligation légale 10 ans).'
      });
      
    } finally {
      conn.release();
    }
    
  } catch (error) {
    console.error('RGPD erasure error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
