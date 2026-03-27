const prisma = require('../config/prisma');
const { getRedis } = require('../config/redis');
const { hashPassword, comparePassword, hashToken } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken, verifyAccessToken } = require('../utils/tokens');
const { publishEvent } = require('../utils/publisher');

const REFRESH_TTL_DAYS = 7;
const REFRESH_TTL_MS = REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;

// ─── Signup ───────────────────────────────────────────────────────────────────
async function signup(email, password) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw { status: 409, message: 'Email already registered' };

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });

  await publishEvent('auth.user.created', { userId: user.id, email: user.email });

  return { id: user.id, email: user.email };
}

// ─── Login ────────────────────────────────────────────────────────────────────
async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.revoked) throw { status: 401, message: 'Invalid credentials' };

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw { status: 401, message: 'Invalid credentials' };

  const { accessToken, refreshToken, expiresAt } = await _issueTokens(user);

  await publishEvent('auth.user.login', { userId: user.id });

  return { accessToken, refreshToken, expiresAt };
}

// ─── Refresh ──────────────────────────────────────────────────────────────────
async function refresh(rawRefreshToken) {
  const tokenHash = hashToken(rawRefreshToken);
  const redis = await getRedis();

  // Check Redis first (fast path)
  const cachedUserId = await redis.get(`refresh:${tokenHash}`);
  if (!cachedUserId) throw { status: 401, message: 'Invalid or expired refresh token' };

  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!stored || stored.expiresAt < new Date()) {
    await redis.del(`refresh:${tokenHash}`);
    throw { status: 401, message: 'Invalid or expired refresh token' };
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user || user.revoked) throw { status: 401, message: 'User not found or revoked' };

  // Rotation — delete old token
  await prisma.refreshToken.delete({ where: { tokenHash } });
  await redis.del(`refresh:${tokenHash}`);

  const { accessToken, refreshToken: newRefreshToken, expiresAt } = await _issueTokens(user);

  return { accessToken, refreshToken: newRefreshToken, expiresAt };
}

// ─── Logout ───────────────────────────────────────────────────────────────────
async function logout(rawRefreshToken, accessTokenPayload) {
  const redis = await getRedis();

  if (rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    await prisma.refreshToken.deleteMany({ where: { tokenHash } });
    await redis.del(`refresh:${tokenHash}`);
  }

  // Blacklist the access token by jti until it expires
  if (accessTokenPayload?.jti && accessTokenPayload?.exp) {
    const ttl = accessTokenPayload.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await redis.set(`blacklist:${accessTokenPayload.jti}`, '1', { EX: ttl });
    }
  }

  await publishEvent('auth.user.logout', { userId: accessTokenPayload?.sub });
}

// ─── Validate Session ─────────────────────────────────────────────────────────
async function validateSession(accessTokenPayload) {
  const user = await prisma.user.findUnique({ where: { id: accessTokenPayload.sub } });
  if (!user || user.revoked) throw { status: 401, message: 'Session invalid' };
  return { valid: true, userId: user.id };
}

// ─── Revoke All Sessions ──────────────────────────────────────────────────────
async function revokeAllSessions(userId) {
  const tokens = await prisma.refreshToken.findMany({ where: { userId } });
  const redis = await getRedis();

  await prisma.refreshToken.deleteMany({ where: { userId } });
  await prisma.user.update({ where: { id: userId }, data: { revoked: true } });

  for (const t of tokens) {
    await redis.del(`refresh:${t.tokenHash}`);
  }

  await publishEvent('auth.user.revoked', { userId });
}

// ─── Internal: issue access + refresh token pair ──────────────────────────────
async function _issueTokens(user) {
  const accessToken = generateAccessToken(user);
  const rawRefresh = generateRefreshToken();
  const tokenHash = hashToken(rawRefresh);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);

  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const redis = await getRedis();
  await redis.set(`refresh:${tokenHash}`, user.id, {
    EX: REFRESH_TTL_DAYS * 24 * 60 * 60,
  });

  return { accessToken, refreshToken: rawRefresh, expiresAt };
}

module.exports = { signup, login, refresh, logout, validateSession, revokeAllSessions };
