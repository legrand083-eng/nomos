import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import pool from '@/lib/db';
import { unlink } from 'fs/promises';
import { join } from 'path';

export const DELETE = withAuth(async (req, { params, user }) => {
  try {
    const { id: entrepriseId, docId } = params;

    // Get document
    const [documents] = await pool.query(
      `SELECT * FROM documents 
       WHERE id = ? AND entreprise_id = ? AND tenant_id = ?`,
      [docId, entrepriseId, user.tenant_id]
    );

    if (documents.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const document = documents[0];

    // Delete file from filesystem
    try {
      const filePath = join(process.cwd(), 'public', document.file_path);
      await unlink(filePath);
    } catch (err) {
      console.error('Error deleting file:', err);
      // Continue even if file deletion fails
    }

    // Delete from database
    await pool.query(
      'DELETE FROM documents WHERE id = ? AND tenant_id = ?',
      [docId, user.tenant_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
