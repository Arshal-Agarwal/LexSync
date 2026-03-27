const authService = require('../services/authService');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

async function signup(req, res) {
  try {
    const user = await authService.signup(req.body.email, req.body.password);
    res.status(201).json({ message: 'Account created', userId: user.id });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { accessToken, refreshToken, expiresAt } = await authService.login(
      req.body.email,
      req.body.password
    );
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.json({ accessToken, expiresAt });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function refresh(req, res) {
  try {
    const rawRefresh = req.cookies?.refreshToken;
    if (!rawRefresh) return res.status(401).json({ error: 'No refresh token' });

    const { accessToken, refreshToken, expiresAt } = await authService.refresh(rawRefresh);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.json({ accessToken, expiresAt });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function logout(req, res) {
  try {
    const rawRefresh = req.cookies?.refreshToken;
    await authService.logout(rawRefresh, req.user);
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function validateSession(req, res) {
  try {
    const result = await authService.validateSession(req.user);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function revokeSession(req, res) {
  try {
    await authService.revokeAllSessions(req.user.sub);
    res.clearCookie('refreshToken');
    res.json({ message: 'All sessions revoked' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { signup, login, refresh, logout, validateSession, revokeSession };
