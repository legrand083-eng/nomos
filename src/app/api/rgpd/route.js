/**
 * NOMOΣ — RGPD API
 * Data export, erasure, consent management
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/withAuth';
import {
  createRgpdRequest,
  getPendingRequests,
  getRgpdStats,
  getUserConsents,
  recordConsent,
  withdrawConsent
} from '@/lib/rgpd';

/**
 * GET /api/rgpd
 * Get RGPD requests or consents
 */
export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'pending_requests') {
      // Admin only
      if (user.role !== 'admin') {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }
      
      const requests = await getPendingRequests(user.tenant_id);
      return NextResponse.json({ success: true, requests });
    }
    
    if (action === 'stats') {
      // Admin only
      if (user.role !== 'admin') {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }
      
      const stats = await getRgpdStats(user.tenant_id);
      return NextResponse.json({ success: true, stats });
    }
    
    if (action === 'consents') {
      const consents = await getUserConsents(user.id);
      return NextResponse.json({ success: true, consents });
    }
    
    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    
  } catch (error) {
    console.error('RGPD GET error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rgpd
 * Create RGPD request or manage consent
 */
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const body = await request.json();
    const { action, type, consent_type, consented } = body;
    
    if (action === 'create_request') {
      // Create RGPD request (export, erasure, etc.)
      if (!type) {
        return NextResponse.json({ error: 'Type requis' }, { status: 400 });
      }
      
      const requestId = await createRgpdRequest(
        user.tenant_id,
        user.id,
        type,
        body.notes || null
      );
      
      return NextResponse.json({
        success: true,
        request_id: requestId,
        message: 'Demande RGPD créée avec succès'
      });
    }
    
    if (action === 'record_consent') {
      // Record consent
      if (!consent_type || consented === undefined) {
        return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
      }
      
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      await recordConsent(user.id, consent_type, consented, ipAddress, userAgent);
      
      return NextResponse.json({
        success: true,
        message: 'Consentement enregistré'
      });
    }
    
    if (action === 'withdraw_consent') {
      // Withdraw consent
      if (!consent_type) {
        return NextResponse.json({ error: 'consent_type requis' }, { status: 400 });
      }
      
      await withdrawConsent(user.id, consent_type);
      
      return NextResponse.json({
        success: true,
        message: 'Consentement retiré'
      });
    }
    
    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    
  } catch (error) {
    console.error('RGPD POST error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
