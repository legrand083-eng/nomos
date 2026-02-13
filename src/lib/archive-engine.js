/**
 * NOMOΣ — Archive Engine
 * Legal document archiving with 10-year retention and integrity verification
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const pool = require('./db');

/**
 * Calculate SHA-256 hash of a file
 */
async function calculateFileHash(filePath) {
  const fileBuffer = await fs.readFile(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

/**
 * Get retention period based on document type
 */
function getRetentionYears(type) {
  const retentionRules = {
    'certificat': 10,
    'dgd': 10,
    'courrier': 10,
    'situation': 10,
    'contrat': 10,
    'avenant': 10,
    'pv_reception': 20, // 10 years + décennale
    'pedigree': 12, // project duration + 2 years (estimated)
    'autre': 5
  };
  return retentionRules[type] || 10;
}

/**
 * Archive a document with legal value
 * @param {number} tenantId - Tenant ID
 * @param {number} operationId - Operation ID
 * @param {string} type - Document type
 * @param {string} sourceFilePath - Source file path
 * @param {string} reference - Document reference
 * @param {string} description - Document description
 * @param {Date} dateDocument - Document date
 * @param {number} archivedBy - User ID who archived
 * @returns {Promise<number>} Archive ID
 */
async function archiveDocument(tenantId, operationId, type, sourceFilePath, reference, description, dateDocument, archivedBy) {
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();
    
    // 1. Calculate SHA-256 hash
    const sha256Hash = await calculateFileHash(sourceFilePath);
    
    // 2. Prepare archive storage path
    const year = new Date(dateDocument).getFullYear();
    const archiveDir = path.join('/archives', String(tenantId), String(operationId), String(year));
    await fs.mkdir(archiveDir, { recursive: true });
    
    const fileName = `${type}-${reference.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
    const archivePath = path.join(archiveDir, fileName);
    
    // 3. Copy file to archive storage
    await fs.copyFile(sourceFilePath, archivePath);
    
    // 4. Get file size and mime type
    const stats = await fs.stat(archivePath);
    const fileSize = stats.size;
    const mimeType = 'application/pdf'; // Default, can be detected
    
    // 5. Calculate retention and expiration
    const retentionYears = getRetentionYears(type);
    const dateExpiration = new Date(dateDocument);
    dateExpiration.setFullYear(dateExpiration.getFullYear() + retentionYears);
    
    // 6. Insert into archives table
    const [result] = await conn.query(
      `INSERT INTO archives 
       (tenant_id, operation_id, type, reference, description, file_path, file_size, 
        sha256_hash, mime_type, date_document, date_expiration, retention_years, 
        archived_by, verified_hash, valeur_probante)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, TRUE)`,
      [tenantId, operationId, type, reference, description, archivePath, fileSize,
       sha256Hash, mimeType, dateDocument, dateExpiration, retentionYears, archivedBy]
    );
    
    const archiveId = result.insertId;
    
    // 7. Log to audit trail
    await conn.query(
      `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, details)
       VALUES (?, ?, 'archive_document', 'archive', ?, ?)`,
      [tenantId, archivedBy, archiveId, JSON.stringify({ type, reference, sha256Hash })]
    );
    
    await conn.commit();
    return archiveId;
    
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Verify archive integrity by recalculating hash
 * @param {number} archiveId - Archive ID
 * @returns {Promise<boolean>} True if integrity verified
 */
async function verifyArchiveIntegrity(archiveId) {
  const conn = await pool.getConnection();
  
  try {
    // Get archive record
    const [archives] = await conn.query(
      'SELECT * FROM archives WHERE id = ?',
      [archiveId]
    );
    
    if (archives.length === 0) {
      throw new Error('Archive not found');
    }
    
    const archive = archives[0];
    
    // Recalculate hash
    const currentHash = await calculateFileHash(archive.file_path);
    
    // Compare with stored hash
    const isValid = currentHash === archive.sha256_hash;
    
    // Update verification status
    await conn.query(
      `UPDATE archives 
       SET verified_hash = ?, last_verification = NOW()
       WHERE id = ?`,
      [isValid, archiveId]
    );
    
    // If mismatch, create CRITICAL security event
    if (!isValid) {
      await conn.query(
        `INSERT INTO security_events 
         (tenant_id, type, severity, details)
         VALUES (?, 'admin_action', 'critical', ?)`,
        [archive.tenant_id, JSON.stringify({
          event: 'archive_integrity_failure',
          archive_id: archiveId,
          reference: archive.reference,
          stored_hash: archive.sha256_hash,
          current_hash: currentHash
        })]
      );
    }
    
    return isValid;
    
  } finally {
    conn.release();
  }
}

/**
 * Cleanup expired archives
 * Deletes files and marks archives as expired
 * @returns {Promise<number>} Number of archives cleaned up
 */
async function cleanupExpiredArchives() {
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();
    
    // Find expired archives
    const [expiredArchives] = await conn.query(
      `SELECT id, file_path, tenant_id, reference 
       FROM archives 
       WHERE date_expiration < NOW() AND status = 'actif'`
    );
    
    let cleanedCount = 0;
    
    for (const archive of expiredArchives) {
      try {
        // Delete file
        await fs.unlink(archive.file_path);
        
        // Update status
        await conn.query(
          `UPDATE archives SET status = 'expire' WHERE id = ?`,
          [archive.id]
        );
        
        // Log to audit
        await conn.query(
          `INSERT INTO audit_logs (tenant_id, action, entity_type, entity_id, details)
           VALUES (?, 'cleanup_expired_archive', 'archive', ?, ?)`,
          [archive.tenant_id, archive.id, JSON.stringify({ reference: archive.reference })]
        );
        
        cleanedCount++;
        
      } catch (fileError) {
        console.error(`Failed to delete archive file ${archive.file_path}:`, fileError);
        // Continue with other archives
      }
    }
    
    await conn.commit();
    return cleanedCount;
    
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Get archives for an operation
 */
async function getOperationArchives(operationId, tenantId) {
  const conn = await pool.getConnection();
  
  try {
    const [archives] = await conn.query(
      `SELECT a.*, u.name as archived_by_name
       FROM archives a
       LEFT JOIN users u ON a.archived_by = u.id
       WHERE a.operation_id = ? AND a.tenant_id = ?
       ORDER BY a.date_document DESC`,
      [operationId, tenantId]
    );
    
    return archives;
    
  } finally {
    conn.release();
  }
}

/**
 * Get archive statistics for a tenant
 */
async function getArchiveStats(tenantId) {
  const conn = await pool.getConnection();
  
  try {
    const [stats] = await conn.query(
      `SELECT 
         COUNT(*) as total_archives,
         SUM(file_size) as total_size,
         COUNT(CASE WHEN status = 'actif' THEN 1 END) as active_archives,
         COUNT(CASE WHEN status = 'expire' THEN 1 END) as expired_archives,
         COUNT(CASE WHEN verified_hash = TRUE THEN 1 END) as verified_archives,
         COUNT(CASE WHEN date_expiration < DATE_ADD(NOW(), INTERVAL 30 DAY) AND status = 'actif' THEN 1 END) as expiring_soon
       FROM archives
       WHERE tenant_id = ?`,
      [tenantId]
    );
    
    return stats[0];
    
  } finally {
    conn.release();
  }
}

module.exports = {
  archiveDocument,
  verifyArchiveIntegrity,
  cleanupExpiredArchives,
  getOperationArchives,
  getArchiveStats,
  calculateFileHash,
  getRetentionYears
};
