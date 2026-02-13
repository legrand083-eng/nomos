/**
 * NOMOΣ — Encryption Module
 * AES-256-GCM encryption for sensitive data (SIRET, RIB, emails)
 */

const crypto = require('crypto');

// Encryption key (should be stored in environment variable)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

/**
 * Ensure encryption key is 32 bytes
 */
function getEncryptionKey() {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
  }
  return key;
}

/**
 * Encrypt a field value
 * @param {string} value - Plain text value
 * @returns {string} Encrypted value in format: iv:authTag:encrypted
 */
function encryptField(value) {
  if (!value) return null;
  
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt field');
  }
}

/**
 * Decrypt a field value
 * @param {string} encrypted - Encrypted value in format: iv:authTag:encrypted
 * @returns {string} Plain text value
 */
function decryptField(encrypted) {
  if (!encrypted) return null;
  
  try {
    const key = getEncryptionKey();
    const parts = encrypted.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedData = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
    
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt field');
  }
}

/**
 * Hash a value (one-way, for comparison only)
 * Used for SIRET/SIREN when only comparison is needed
 */
function hashField(value) {
  if (!value) return null;
  
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}

/**
 * Encrypt multiple fields in an object
 * @param {object} data - Object with fields to encrypt
 * @param {array} fields - Array of field names to encrypt
 * @returns {object} Object with encrypted fields
 */
function encryptFields(data, fields) {
  const encrypted = { ...data };
  
  for (const field of fields) {
    if (encrypted[field]) {
      encrypted[field] = encryptField(encrypted[field]);
    }
  }
  
  return encrypted;
}

/**
 * Decrypt multiple fields in an object
 * @param {object} data - Object with encrypted fields
 * @param {array} fields - Array of field names to decrypt
 * @returns {object} Object with decrypted fields
 */
function decryptFields(data, fields) {
  const decrypted = { ...data };
  
  for (const field of fields) {
    if (decrypted[field]) {
      try {
        decrypted[field] = decryptField(decrypted[field]);
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error);
        decrypted[field] = '[ENCRYPTED]';
      }
    }
  }
  
  return decrypted;
}

/**
 * Mask sensitive data for display
 * @param {string} value - Value to mask
 * @param {number} visibleChars - Number of characters to show at end
 * @returns {string} Masked value
 */
function maskField(value, visibleChars = 4) {
  if (!value || value.length <= visibleChars) {
    return '****';
  }
  
  const masked = '*'.repeat(value.length - visibleChars);
  const visible = value.slice(-visibleChars);
  
  return masked + visible;
}

/**
 * Generate a secure random token
 * @param {number} length - Token length in bytes (default 32)
 * @returns {string} Hex token
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Validate encryption key format
 */
function validateEncryptionKey() {
  try {
    getEncryptionKey();
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  encryptField,
  decryptField,
  hashField,
  encryptFields,
  decryptFields,
  maskField,
  generateToken,
  validateEncryptionKey
};
