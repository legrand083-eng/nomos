/**
 * NOMOΣ — Archive Download API
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/withAuth';
import pool from '@/lib/db';
import fs from 'fs/promises';

/**
 * GET /api/archives/download?id=123
 * Download an archived document
 */
export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const archiveId = searchParams.get('id');
    
    if (!archiveId) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }
    
    const conn = await pool.getConnection();
    
    try {
      // Get archive record
      const [archives] = await conn.query(
        `SELECT * FROM archives 
         WHERE id = ? AND tenant_id = ?`,
        [archiveId, user.tenant_id]
      );
      
      if (archives.length === 0) {
        return NextResponse.json({ error: 'Archive non trouvée' }, { status: 404 });
      }
      
      const archive = archives[0];
      
      // Read file
      const fileBuffer = await fs.readFile(archive.file_path);
      
      // Log download event
      await conn.query(
        `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, details)
         VALUES (?, ?, 'download_archive', 'archive', ?, ?)`,
        [user.tenant_id, user.id, archive.id, JSON.stringify({ reference: archive.reference })]
      );
      
      // Return file
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': archive.mime_type,
          'Content-Disposition': `attachment; filename="${archive.reference}.pdf"`,
          'Content-Length': archive.file_size.toString()
        }
      });
      
    } finally {
      conn.release();
    }
    
  } catch (error) {
    console.error('Archive download error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement' },
      { status: 500 }
    );
  }
}
