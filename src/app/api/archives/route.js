/**
 * NOMOΣ — Archives API
 * CRUD operations for legal document archives
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/withAuth';
import {
  archiveDocument,
  getOperationArchives,
  getArchiveStats
} from '@/lib/archive-engine';

/**
 * GET /api/archives
 * Get archives for an operation or tenant stats
 */
export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const operationId = searchParams.get('operation_id');
    const getStats = searchParams.get('stats') === 'true';
    
    if (getStats) {
      const stats = await getArchiveStats(user.tenant_id);
      return NextResponse.json({ success: true, stats });
    }
    
    if (!operationId) {
      return NextResponse.json({ error: 'operation_id requis' }, { status: 400 });
    }
    
    const archives = await getOperationArchives(parseInt(operationId), user.tenant_id);
    
    return NextResponse.json({ success: true, archives });
    
  } catch (error) {
    console.error('Archives GET error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/archives
 * Create a new archive
 */
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const body = await request.json();
    const {
      operation_id,
      type,
      source_file_path,
      reference,
      description,
      date_document
    } = body;
    
    // Validate required fields
    if (!operation_id || !type || !source_file_path || !reference || !date_document) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }
    
    const archiveId = await archiveDocument(
      user.tenant_id,
      operation_id,
      type,
      source_file_path,
      reference,
      description || null,
      new Date(date_document),
      user.id
    );
    
    return NextResponse.json({
      success: true,
      archive_id: archiveId,
      message: 'Document archivé avec succès'
    });
    
  } catch (error) {
    console.error('Archives POST error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'archivage' },
      { status: 500 }
    );
  }
}
