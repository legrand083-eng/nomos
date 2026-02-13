/* ═══════════════════════════════════════════════════════════════
   NOMOΣ — Authentication (JWT + Refresh Token)
   - Access token: 15 min
   - Refresh token: 7 days (stored in DB)
   - Single session per user
   - Screen lock after 15 min inactivity
   ═══════════════════════════════════════════════════════════════ */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { query, queryOne } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const SALT_ROUNDS = 12;

/* ─── Password hashing ──────────────────────────────────────── */

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/* ─── Anti-robot validation ─────────────────────────────────── */

function validateAntiRobot(lastName, firstName, inputCode) {
  // Expected: first 3 chars of lastName UPPERCASE + first 3 chars of firstName lowercase
  if (!lastName || !firstName || !inputCode) return false;
  const expected = lastName.substring(0, 3).toUpperCase() + firstName.substring(0, 3).toLowerCase();
  return inputCode === expected;
}

/* ─── Token generation ──────────────────────────────────────── */

function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.id, tenantId: user.tenant_id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

/* ─── Login ─────────────────────────────────────────────────── */

async function login(email, password, antiRobotCode, ipAddress, userAgent) {
  // 1. Find user
  const user = await queryOne(
    'SELECT * FROM users WHERE email = ? AND status = "active"',
    [email]
  );

  if (!user) {
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }

  // 2. Check lock
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    return { success: false, error: 'ACCOUNT_LOCKED', lockedUntil: user.locked_until };
  }

  // 3. Validate anti-robot
  if (!validateAntiRobot(user.last_name, user.first_name, antiRobotCode)) {
    return { success: false, error: 'ANTI_ROBOT_FAILED' };
  }

  // 4. Verify password
  const passwordValid = await verifyPassword(password, user.password_hash);
  if (!passwordValid) {
    const newCount = user.failed_login_count + 1;
    const lockUntil = newCount >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;
    await query(
      'UPDATE users SET failed_login_count = ?, locked_until = ? WHERE id = ?',
      [newCount, lockUntil, user.id]
    );
    return { success: false, error: 'INVALID_CREDENTIALS', attemptsLeft: Math.max(0, 5 - newCount) };
  }

  // 5. Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // 6. Kill previous session (single session rule) + create new
  await query('DELETE FROM sessions WHERE user_id = ?', [user.id]);
  await query(
    'INSERT INTO sessions (user_id, refresh_token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
    [user.id, refreshToken, ipAddress, userAgent]
  );

  // 7. Reset failed attempts + update last login
  await query(
    'UPDATE users SET failed_login_count = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?',
    [user.id]
  );

  // 8. Audit log
  await query(
    'INSERT INTO audit_log (tenant_id, user_id, action, entity_type, entity_id, details, ip_address, user_agent, hash_sha256) VALUES (?, ?, "LOGIN_SUCCESS", "user", ?, ?, ?, ?, SHA2(CONCAT("LOGIN_SUCCESS", ?, NOW()), 256))',
    [user.tenant_id, user.id, user.id, JSON.stringify({ email: user.email }), ipAddress, userAgent, user.id]
  );

  return {
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    }
  };
}

/* ─── Refresh ───────────────────────────────────────────────── */

async function refresh(refreshToken) {
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) return { success: false, error: 'INVALID_REFRESH_TOKEN' };

  const session = await queryOne(
    'SELECT s.*, u.* FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.refresh_token = ? AND s.expires_at > NOW()',
    [refreshToken]
  );

  if (!session) return { success: false, error: 'SESSION_EXPIRED' };

  const newAccessToken = generateAccessToken(session);
  return { success: true, accessToken: newAccessToken };
}

/* ─── Logout ────────────────────────────────────────────────── */

async function logout(userId) {
  await query('DELETE FROM sessions WHERE user_id = ?', [userId]);
  return { success: true };
}

/* ─── Verify Auth (Next.js App Router) ─────────────────── */

async function verifyAuth(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    if (!payload) {
      return null;
    }
    
    return {
      id: payload.userId,
      tenant_id: payload.tenantId,
      email: payload.email,
      role: payload.role,
      first_name: payload.firstName,
      last_name: payload.lastName
    };
  } catch (error) {
    console.error('verifyAuth error:', error);
    return null;
  }
}

module.exports = {
  hashPassword, verifyPassword, validateAntiRobot,
  generateAccessToken, generateRefreshToken,
  verifyAccessToken, verifyRefreshToken,
  login, refresh, logout,
  verifyAuth
};
