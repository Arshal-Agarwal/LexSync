const router = require('express').Router();
const controller = require('../controllers/authController');
const { validate } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authenticate');
const { authLimiter } = require('../middlewares/rateLimiter');

// Public — rate limited
router.post('/signup',          authLimiter, validate('signup'),          controller.signup);
router.post('/login',           authLimiter, validate('login'),           controller.login);
router.post('/refresh',         authLimiter,                              controller.refresh);
router.post('/forgot-password', authLimiter, validate('forgotPassword'),  (req, res) => res.json({ message: 'If that email exists, a reset link was sent.' }));
router.post('/reset-password',  authLimiter, validate('resetPassword'),   (req, res) => res.json({ message: 'Password reset — not yet implemented.' }));

// Protected
router.post('/logout',           authenticate, controller.logout);
router.post('/session/validate', authenticate, controller.validateSession);
router.post('/session/revoke',   authenticate, controller.revokeSession);

module.exports = router;
