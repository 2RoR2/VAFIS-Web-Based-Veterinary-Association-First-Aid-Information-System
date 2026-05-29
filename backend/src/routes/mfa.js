import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  disableMfa,
  getMfaStatus,
  initiateMfaEnable,
  verifyMfaEnable,
  sendOtpEmail,
} from '../controllers/mfa.js';

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

export const createMfaRouter = (pool) => {
  const router = Router();

  // All MFA management endpoints require the user to be logged in
  router.get('/status',           requireAuth, asyncHandler(getMfaStatus(pool)));
  router.post('/enable/initiate', requireAuth, asyncHandler(initiateMfaEnable(pool)));
  router.post('/enable/verify',   requireAuth, asyncHandler(verifyMfaEnable(pool)));
  router.post('/disable',         requireAuth, asyncHandler(disableMfa(pool)));

  // ── DEV-only SMTP smoke test (no auth needed) ─────────────────────────────
  // Hit: GET http://localhost:4000/api/mfa/test-email?to=youraddress@gmail.com
  // Remove this route before going to production.
  router.get('/test-email', asyncHandler(async (req, res) => {
    const to = String(req.query.to ?? '');
    if (!to || !to.includes('@')) {
      res.status(400).json({ error: 'Pass ?to=your@email.com in the query string.' });
      return;
    }
    try {
      await sendOtpEmail(to, '123456', 'verify');
      res.json({ ok: true, message: `Test email sent to ${to}. Check your server logs too.` });
    } catch (err) {
      console.error('[EMAIL TEST] Failed:', err);
      res.status(500).json({ ok: false, error: err.message, detail: String(err) });
    }
  }));

  return router;
};
