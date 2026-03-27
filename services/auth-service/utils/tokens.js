const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const SECRET = process.env.JWT_SECRET;
const EXPIRES = process.env.JWT_EXPIRES || '15m';

function generateAccessToken(user) {
  return jwt.sign(
    {
      iss: 'lexsync-auth',
      sub: user.id,
      aud: 'lexsync-api',
      jti: uuidv4(),
      roles: user.roles || [],
      team_id: user.teamId || null,
      org_id: user.orgId || null,
    },
    SECRET,
    { expiresIn: EXPIRES }
  );
}

function generateRefreshToken() {
  return uuidv4();
}

function verifyAccessToken(token) {
  return jwt.verify(token, SECRET, { audience: 'lexsync-api', issuer: 'lexsync-auth' });
}

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken };
