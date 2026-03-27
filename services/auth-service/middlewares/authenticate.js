const { verifyAccessToken } = require('../utils/tokens');
const { getRedis } = require('../config/redis');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);

    // Check blacklist
    const redis = await getRedis();
    const blacklisted = await redis.get(`blacklist:${payload.jti}`);
    if (blacklisted) return res.status(401).json({ error: 'Token revoked' });

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };
