/**
 * NOMOΣ — Security Hardening
 * Rate limiting, password policy, input sanitization
 */

const pool = require('./db');

// In-memory rate limiting store (use Redis in production)
const rateLimitStore = new Map();

/**
 * Rate limiting configuration
 */
const RATE_LIMITS = {
  login: { max: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 min
  api: { max: 100, window: 60 * 1000 }, // 100 requests per min
  upload: { max: 10, window: 60 * 60 * 1000 } // 10 uploads per hour
};

/**
 * Check rate limit for a given key
 * @param {string} type - Rate limit type (login, api, upload)
 * @param {string} identifier - IP address or user ID
 * @returns {boolean} True if within limit
 */
function checkRateLimit(type, identifier) {
  const config = RATE_LIMITS[type];
  if (!config) return true;
  
  const key = `${type}:${identifier}`;
  const now = Date.now();
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }
  
  const attempts = rateLimitStore.get(key);
  
  // Remove old attempts outside the window
  const validAttempts = attempts.filter(timestamp => now - timestamp < config.window);
  
  if (validAttempts.length >= config.max) {
    return false; // Rate limit exceeded
  }
  
  // Add current attempt
  validAttempts.push(now);
  rateLimitStore.set(key, validAttempts);
  
  return true;
}

/**
 * Log security event
 */
async function logSecurityEvent(tenantId, userId, type, severity, ipAddress, userAgent, details) {
  const conn = await pool.getConnection();
  
  try {
    await conn.query(
      `INSERT INTO security_events 
       (tenant_id, user_id, type, severity, ip_address, user_agent, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, userId, type, severity, ipAddress, userAgent, JSON.stringify(details)]
    );
  } finally {
    conn.release();
  }
}

/**
 * Validate password strength
 * Minimum 12 characters, uppercase, lowercase, digit, special
 */
function validatePasswordStrength(password) {
  if (password.length < 12) {
    return { valid: false, error: 'Le mot de passe doit contenir au moins 12 caractères' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Le mot de passe doit contenir au moins une majuscule' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Le mot de passe doit contenir au moins une minuscule' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Le mot de passe doit contenir au moins un chiffre' };
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, error: 'Le mot de passe doit contenir au moins un caractère spécial' };
  }
  
  return { valid: true };
}

/**
 * Check if password was recently used
 * Prevents reuse of last 5 passwords
 */
async function checkPasswordReuse(userId, newPasswordHash) {
  const conn = await pool.getConnection();
  
  try {
    // Get last 5 password hashes from audit log
    const [history] = await conn.query(
      `SELECT details FROM audit_logs 
       WHERE user_id = ? AND action = 'password_change'
       ORDER BY created_at DESC
       LIMIT 5`,
      [userId]
    );
    
    for (const record of history) {
      const details = JSON.parse(record.details);
      if (details.password_hash === newPasswordHash) {
        return false; // Password was recently used
      }
    }
    
    return true; // Password is new
    
  } finally {
    conn.release();
  }
}

/**
 * Sanitize HTML to prevent XSS
 */
function sanitizeHTML(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate file upload
 * Check mime type and extension
 */
function validateFileUpload(filename, mimetype) {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'image/jpeg',
    'image/png'
  ];
  
  const allowedExtensions = ['.pdf', '.xlsx', '.xls', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  if (!allowedExtensions.includes(ext)) {
    return { valid: false, error: 'Extension de fichier non autorisée' };
  }
  
  if (!allowedMimeTypes.includes(mimetype)) {
    return { valid: false, error: 'Type de fichier non autorisé' };
  }
  
  return { valid: true };
}

/**
 * Check for suspicious IP patterns
 */
async function checkSuspiciousIP(ipAddress, tenantId) {
  const conn = await pool.getConnection();
  
  try {
    // Check recent failed login attempts from this IP
    const [failedAttempts] = await conn.query(
      `SELECT COUNT(*) as count
       FROM security_events
       WHERE ip_address = ? 
         AND type = 'login_failed'
         AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
      [ipAddress]
    );
    
    if (failedAttempts[0].count >= 10) {
      // Log brute force attempt
      await logSecurityEvent(
        tenantId,
        null,
        'brute_force',
        'critical',
        ipAddress,
        null,
        { failed_attempts: failedAttempts[0].count }
      );
      
      return true; // Suspicious
    }
    
    return false; // Not suspicious
    
  } finally {
    conn.release();
  }
}

/**
 * Get security headers for middleware
 */
function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:",
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
}

/**
 * Verify CSRF token
 */
function verifyCsrfToken(token, sessionToken) {
  return token === sessionToken;
}

/**
 * Get critical security alerts
 */
async function getCriticalAlerts(tenantId, limit = 10) {
  const conn = await pool.getConnection();
  
  try {
    const [alerts] = await conn.query(
      `SELECT * FROM security_events
       WHERE severity = 'critical'
         AND (tenant_id = ? OR tenant_id IS NULL)
       ORDER BY created_at DESC
       LIMIT ?`,
      [tenantId, limit]
    );
    
    return alerts;
    
  } finally {
    conn.release();
  }
}

/**
 * Get security statistics
 */
async function getSecurityStats(tenantId, days = 7) {
  const conn = await pool.getConnection();
  
  try {
    const [stats] = await conn.query(
      `SELECT 
         COUNT(*) as total_events,
         COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_events,
         COUNT(CASE WHEN severity = 'warning' THEN 1 END) as warning_events,
         COUNT(CASE WHEN type = 'login_failed' THEN 1 END) as failed_logins,
         COUNT(CASE WHEN type = 'brute_force' THEN 1 END) as brute_force_attempts,
         COUNT(DISTINCT ip_address) as unique_ips
       FROM security_events
       WHERE (tenant_id = ? OR tenant_id IS NULL)
         AND created_at > DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [tenantId, days]
    );
    
    return stats[0];
    
  } finally {
    conn.release();
  }
}

module.exports = {
  checkRateLimit,
  logSecurityEvent,
  validatePasswordStrength,
  checkPasswordReuse,
  sanitizeHTML,
  validateFileUpload,
  checkSuspiciousIP,
  getSecurityHeaders,
  verifyCsrfToken,
  getCriticalAlerts,
  getSecurityStats
};
