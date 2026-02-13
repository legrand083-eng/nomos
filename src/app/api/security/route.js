/**
 * NOMOΣ — Security API
 * Security events monitoring and alerts
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/withAuth';
import {
  logSecurityEvent,
  getCriticalAlerts,
  getSecurityStats
} from '@/lib/security';

/**
 * GET /api/security
 * Get security events and statistics
 */
export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Admin only
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'critical_alerts') {
      const limit = parseInt(searchParams.get('limit') || '10');
      const alerts = await getCriticalAlerts(user.tenant_id, limit);
      return NextResponse.json({ success: true, alerts });
    }
    
    if (action === 'stats') {
      const days = parseInt(searchParams.get('days') || '7');
      const stats = await getSecurityStats(user.tenant_id, days);
      return NextResponse.json({ success: true, stats });
    }
    
    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    
  } catch (error) {
    console.error('Security GET error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/security
 * Log a security event
 */
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const body = await request.json();
    const { type, severity, details } = body;
    
    if (!type || !severity) {
      return NextResponse.json(
        { error: 'type et severity requis' },
        { status: 400 }
      );
    }
    
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await logSecurityEvent(
      user.tenant_id,
      user.id,
      type,
      severity,
      ipAddress,
      userAgent,
      details || {}
    );
    
    return NextResponse.json({
      success: true,
      message: 'Événement de sécurité enregistré'
    });
    
  } catch (error) {
    console.error('Security POST error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
