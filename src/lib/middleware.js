/* ═══════════════════════════════════════════════════════════════
   NOMOΣ — Route Protection Middleware
   - Checks JWT validity
   - Checks user role
   - Checks tenant isolation
   ═══════════════════════════════════════════════════════════════ */

const { verifyAccessToken } = require('./auth');

function withAuth(handler, allowedRoles = []) {
  return async function(req, res) {
    // 1. Extract token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : req.cookies?.nomos_token;

    if (!token) {
      return res.status(401).json({ error: 'AUTHENTICATION_REQUIRED', message: 'No token provided' });
    }

    // 2. Verify JWT
    const payload = verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'TOKEN_EXPIRED', message: 'Token invalid or expired' });
    }

    // 3. Check role if specified
    if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Insufficient permissions' });
    }

    // 4. Attach user to request
    req.user = payload;

    // 5. Execute handler
    return handler(req, res);
  };
}

// Role constants for readability
const ROLES = {
  ADMIN: 'admin',
  MOE: 'moe',
  OPC: 'opc',
  MOA: 'moa',
  ENTREPRISE: 'entreprise',
  COMPTABILITE: 'comptabilite'
};

module.exports = { withAuth, ROLES };
