/**
 * NOMOΣ — RGPD Export API
 * Export user data (Article 20 - Right to data portability)
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { exportUserData } from '@/lib/rgpd';

/**
 * POST /api/rgpd/export
 * Export user data (admin processing)
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
      
      // Export user data
      const exportPath = await exportUserData(rgpdRequest.user_id, request_id);
      
      return NextResponse.json({
        success: true,
        export_path: exportPath,
        message: 'Export RGPD généré avec succès'
      });
      
    } finally {
      conn.release();
    }
    
  } catch (error) {
    console.error('RGPD export error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}
