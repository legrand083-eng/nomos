/**
 * NOMOΣ — RGPD Compliance Module
 * Data export, erasure, anonymization
 */

const pool = require('./db');
const fs = require('fs').promises;
const path = require('path');

/**
 * Export all user data (RGPD Article 20 - Right to data portability)
 * @param {number} userId - User ID
 * @param {number} requestId - RGPD request ID
 * @returns {Promise<string>} Path to export file
 */
async function exportUserData(userId, requestId) {
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();
    
    // Update request status
    await conn.query(
      'UPDATE rgpd_requests SET status = ?, processed_at = NOW() WHERE id = ?',
      ['processing', requestId]
    );
    
    // Collect user data from all tables
    const userData = {};
    
    // User profile
    const [users] = await conn.query(
      'SELECT id, email, name, role, created_at, last_login FROM users WHERE id = ?',
      [userId]
    );
    userData.profile = users[0];
    
    // RGPD consents
    const [consents] = await conn.query(
      'SELECT * FROM rgpd_consents WHERE user_id = ?',
      [userId]
    );
    userData.consents = consents;
    
    // Operations (as MOA, MOE, or OPC)
    const [operations] = await conn.query(
      `SELECT o.* FROM operations o
       LEFT JOIN users u ON o.moa_user_id = u.id OR o.moe_user_id = u.id OR o.opc_user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );
    userData.operations = operations;
    
    // Notifications
    const [notifications] = await conn.query(
      'SELECT * FROM notifications WHERE user_id = ?',
      [userId]
    );
    userData.notifications = notifications;
    
    // Audit logs
    const [auditLogs] = await conn.query(
      'SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100',
      [userId]
    );
    userData.audit_logs = auditLogs;
    
    // Sessions
    const [sessions] = await conn.query(
      'SELECT * FROM sessions WHERE user_id = ?',
      [userId]
    );
    userData.sessions = sessions;
    
    // Security events
    const [securityEvents] = await conn.query(
      'SELECT * FROM security_events WHERE user_id = ? ORDER BY created_at DESC LIMIT 100',
      [userId]
    );
    userData.security_events = securityEvents;
    
    // Generate JSON export
    const exportData = {
      export_date: new Date().toISOString(),
      user_id: userId,
      data: userData
    };
    
    const exportJson = JSON.stringify(exportData, null, 2);
    
    // Save to file
    const exportDir = '/exports/rgpd';
    await fs.mkdir(exportDir, { recursive: true });
    
    const exportFilename = `rgpd-export-user-${userId}-${Date.now()}.json`;
    const exportPath = path.join(exportDir, exportFilename);
    
    await fs.writeFile(exportPath, exportJson, 'utf8');
    
    // Update request with export path
    await conn.query(
      'UPDATE rgpd_requests SET status = ?, export_path = ?, processed_at = NOW() WHERE id = ?',
      ['completed', exportPath, requestId]
    );
    
    // Log security event
    await conn.query(
      `INSERT INTO security_events (user_id, type, severity, details)
       VALUES (?, 'data_export', 'warning', ?)`,
      [userId, JSON.stringify({ request_id: requestId, export_path: exportPath })]
    );
    
    await conn.commit();
    return exportPath;
    
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Erase user data (RGPD Article 17 - Right to erasure)
 * IMPORTANT: Financial documents cannot be deleted (10-year legal retention)
 * Only personal identifiers are anonymized
 * 
 * @param {number} userId - User ID
 * @param {number} requestId - RGPD request ID
 * @param {number} processedBy - Admin user ID processing the request
 */
async function eraseUserData(userId, requestId, processedBy) {
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();
    
    // Update request status
    await conn.query(
      'UPDATE rgpd_requests SET status = ?, processed_by = ?, processed_at = NOW() WHERE id = ?',
      ['processing', processedBy, requestId]
    );
    
    const ANONYMIZED = '[SUPPRIMÉ RGPD]';
    
    // 1. Anonymize user profile (keep user_id for referential integrity)
    await conn.query(
      `UPDATE users 
       SET email = ?, name = ?, phone = NULL, password_hash = NULL
       WHERE id = ?`,
      [`anonymized-${userId}@deleted.local`, ANONYMIZED, userId]
    );
    
    // 2. Delete sessions
    await conn.query('DELETE FROM sessions WHERE user_id = ?', [userId]);
    
    // 3. Delete notifications
    await conn.query('DELETE FROM notifications WHERE user_id = ?', [userId]);
    
    // 4. Delete RGPD consents
    await conn.query('DELETE FROM rgpd_consents WHERE user_id = ?', [userId]);
    
    // 5. Anonymize audit logs (keep for legal compliance, anonymize details)
    await conn.query(
      `UPDATE audit_logs 
       SET details = ? 
       WHERE user_id = ?`,
      [JSON.stringify({ anonymized: true }), userId]
    );
    
    // 6. Anonymize security events
    await conn.query(
      `UPDATE security_events 
       SET user_agent = NULL, details = ?
       WHERE user_id = ?`,
      [JSON.stringify({ anonymized: true }), userId]
    );
    
    // 7. KEEP financial documents (certificats, DGD) - legal obligation
    // Only anonymize personal identifiers within operation metadata
    await conn.query(
      `UPDATE operations 
       SET notes = ?
       WHERE moa_user_id = ? OR moe_user_id = ? OR opc_user_id = ?`,
      [ANONYMIZED, userId, userId, userId]
    );
    
    // 8. Mark request as completed
    await conn.query(
      `UPDATE rgpd_requests 
       SET status = ?, processed_at = NOW(), notes = ?
       WHERE id = ?`,
      ['completed', 'Données personnelles anonymisées. Documents financiers conservés (obligation légale 10 ans).', requestId]
    );
    
    // 9. Log security event
    await conn.query(
      `INSERT INTO security_events (user_id, type, severity, details)
       VALUES (?, 'data_export', 'critical', ?)`,
      [processedBy, JSON.stringify({ 
        action: 'rgpd_erasure',
        target_user_id: userId,
        request_id: requestId,
        processed_by: processedBy
      })]
    );
    
    await conn.commit();
    
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Record user consent
 */
async function recordConsent(userId, consentType, consented, ipAddress, userAgent) {
  const conn = await pool.getConnection();
  
  try {
    await conn.query(
      `INSERT INTO rgpd_consents 
       (user_id, consent_type, consented, consented_at, ip_address, user_agent)
       VALUES (?, ?, ?, NOW(), ?, ?)`,
      [userId, consentType, consented, ipAddress, userAgent]
    );
    
  } finally {
    conn.release();
  }
}

/**
 * Withdraw consent
 */
async function withdrawConsent(userId, consentType) {
  const conn = await pool.getConnection();
  
  try {
    await conn.query(
      `UPDATE rgpd_consents 
       SET consented = FALSE, withdrawn_at = NOW()
       WHERE user_id = ? AND consent_type = ?`,
      [userId, consentType]
    );
    
  } finally {
    conn.release();
  }
}

/**
 * Get user consents
 */
async function getUserConsents(userId) {
  const conn = await pool.getConnection();
  
  try {
    const [consents] = await conn.query(
      `SELECT * FROM rgpd_consents 
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    
    return consents;
    
  } finally {
    conn.release();
  }
}

/**
 * Create RGPD request
 */
async function createRgpdRequest(tenantId, userId, type, notes = null) {
  const conn = await pool.getConnection();
  
  try {
    const [result] = await conn.query(
      `INSERT INTO rgpd_requests (tenant_id, user_id, type, notes)
       VALUES (?, ?, ?, ?)`,
      [tenantId, userId, type, notes]
    );
    
    return result.insertId;
    
  } finally {
    conn.release();
  }
}

/**
 * Get pending RGPD requests
 */
async function getPendingRequests(tenantId) {
  const conn = await pool.getConnection();
  
  try {
    const [requests] = await conn.query(
      `SELECT r.*, u.name as user_name, u.email as user_email
       FROM rgpd_requests r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.tenant_id = ? AND r.status = 'pending'
       ORDER BY r.requested_at ASC`,
      [tenantId]
    );
    
    return requests;
    
  } finally {
    conn.release();
  }
}

/**
 * Get RGPD statistics
 */
async function getRgpdStats(tenantId) {
  const conn = await pool.getConnection();
  
  try {
    const [stats] = await conn.query(
      `SELECT 
         COUNT(*) as total_requests,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
         COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests,
         COUNT(CASE WHEN type = 'export' THEN 1 END) as export_requests,
         COUNT(CASE WHEN type = 'erasure' THEN 1 END) as erasure_requests,
         AVG(TIMESTAMPDIFF(HOUR, requested_at, processed_at)) as avg_processing_hours
       FROM rgpd_requests
       WHERE tenant_id = ?`,
      [tenantId]
    );
    
    return stats[0];
    
  } finally {
    conn.release();
  }
}

module.exports = {
  exportUserData,
  eraseUserData,
  recordConsent,
  withdrawConsent,
  getUserConsents,
  createRgpdRequest,
  getPendingRequests,
  getRgpdStats
};
