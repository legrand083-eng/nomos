import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import pool from '@/lib/db';

export const POST = withAuth(async (req, { user }) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const type = formData.get('type');
    const entrepriseId = formData.get('entreprise_id');
    const operationId = formData.get('operation_id');
    const lotId = formData.get('lot_id');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Validate size (15MB)
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must not exceed 15 MB' }, { status: 400 });
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Calculate SHA-256 hash
    const hash = createHash('sha256').update(buffer).digest('hex');

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', user.tenant_id.toString(), operationId || 'general');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${type}_${timestamp}_${file.name}`;
    const filePath = join(uploadDir, filename);
    const publicPath = `/uploads/${user.tenant_id}/${operationId || 'general'}/${filename}`;

    // Write file
    await writeFile(filePath, buffer);

    // Insert document record
    const [result] = await pool.query(
      `INSERT INTO documents (
        tenant_id, operation_id, entreprise_id, lot_id, type, name, 
        file_path, file_size, mime_type, sha256_hash, uploaded_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        user.tenant_id,
        operationId || null,
        entrepriseId || null,
        lotId || null,
        type,
        file.name,
        publicPath,
        file.size,
        file.type,
        hash,
        user.id
      ]
    );

    return NextResponse.json({
      id: result.insertId,
      name: file.name,
      file_path: publicPath,
      file_size: file.size,
      sha256_hash: hash,
      status: 'pending'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
