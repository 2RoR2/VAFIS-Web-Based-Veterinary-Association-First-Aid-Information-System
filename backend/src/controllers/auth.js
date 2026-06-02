import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { generateOtp, MFA_OTP_EXPIRY_MINUTES, sendOtpEmail } from './mfa.js';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'vafis-dev-access-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'vafis-dev-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRES = '5m';
const REFRESH_TOKEN_EXPIRES = '7d';

const DB_TO_FRONTEND_ROLE = {
  user: 'pet-owner',
  professional: 'veterinary-professional',
  admin: 'administrator',
};

const IS_PROD = process.env.NODE_ENV === 'production';

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax',
  maxAge: 5 * 60 * 1000,
  path: '/',
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

// Signs and returns a pair of JWT access and refresh tokens using the given payload.
const signTokens = (payload) => ({
  accessToken: jwt.sign({ ...payload, type: 'access' }, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES }),
  refreshToken: jwt.sign({ ...payload, type: 'refresh' }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES }),
});

// Sets the access and refresh token JWTs as httpOnly cookies on the response.
const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
};

// Removes the access and refresh token cookies from the response to end the session.
const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
};

// Authenticates a user by email and password. If MFA is enabled, issues a short-lived
// pending token and sends an OTP email instead of granting full access immediately.
export const login = (pool) => async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  const user = rows[0];

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  if (user.isSuspended) {
    res.status(403).json({ error: 'This account has been suspended. Please contact the administrator.' });
    return;
  }

  // ── MFA check ──────────────────────────────────────────────────────────────
  if (user.mfaEnabled) {
    const otp = generateOtp();

    // Let MySQL compute the expiry with its own clock — avoids Node ↔ MySQL timezone mismatch
    await pool.execute(
      `UPDATE users SET mfaOtpCode = ?, mfaOtpExpiry = NOW() + INTERVAL ${MFA_OTP_EXPIRY_MINUTES} MINUTE WHERE id = ?`,
      [otp, user.id],
    );

    try {
      await sendOtpEmail(user.email, otp, 'login');
    } catch (err) {
      console.error('Failed to send login MFA email:', err);
      res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
      return;
    }

    // Issue a short-lived pending token — no real auth cookies yet
    const tempToken = jwt.sign(
      { id: user.id, type: 'mfa-pending' },
      JWT_ACCESS_SECRET,
      { expiresIn: `${MFA_OTP_EXPIRY_MINUTES}m` },
    );

    res.json({ mfaRequired: true, tempToken });
    return;
  }
  // ── End MFA check ──────────────────────────────────────────────────────────

  const tokenPayload = { id: user.id, email: user.email, role: user.role, fullName: user.fullName };
  const { accessToken, refreshToken } = signTokens(tokenPayload);

  setAuthCookies(res, accessToken, refreshToken);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: DB_TO_FRONTEND_ROLE[user.role] ?? 'pet-owner',
    },
  });
};

// ── POST /api/auth/mfa/verify ─────────────────────────────────────────────────
// Second step of MFA login — client sends { tempToken, otp }.
// On success: issues real auth cookies and returns the user object.

export const verifyMfaLogin = (pool) => async (req, res) => {
  const { tempToken, otp } = req.body ?? {};

  if (!tempToken || !otp) {
    res.status(400).json({ error: 'tempToken and otp are required.' });
    return;
  }

  let payload;
  try {
    payload = jwt.verify(tempToken, JWT_ACCESS_SECRET);
  } catch {
    res.status(401).json({ error: 'Verification session has expired. Please log in again.' });
    return;
  }

  if (payload.type !== 'mfa-pending') {
    res.status(401).json({ error: 'Invalid token type.' });
    return;
  }

  // Let MySQL compare the expiry with its own NOW() — timezone-safe
  const [rows] = await pool.query(
    'SELECT *, (mfaOtpCode IS NOT NULL AND mfaOtpExpiry > NOW()) AS otpValid FROM users WHERE id = ?',
    [payload.id],
  );
  const user = rows[0];
  if (!user) { res.status(404).json({ error: 'User not found.' }); return; }

  if (!user.mfaOtpCode) {
    res.status(400).json({ error: 'No pending verification. Please log in again.' });
    return;
  }

  if (!user.otpValid) {
    await pool.execute(
      'UPDATE users SET mfaOtpCode = NULL, mfaOtpExpiry = NULL WHERE id = ?',
      [user.id],
    );
    res.status(400).json({ error: 'Verification code has expired. Please log in again.' });
    return;
  }

  if (String(otp).trim() !== String(user.mfaOtpCode)) {
    res.status(401).json({ error: 'Invalid verification code.' });
    return;
  }

  // Clear OTP and issue real tokens
  await pool.execute(
    'UPDATE users SET mfaOtpCode = NULL, mfaOtpExpiry = NULL WHERE id = ?',
    [user.id],
  );

  const tokenPayload = { id: user.id, email: user.email, role: user.role, fullName: user.fullName };
  const { accessToken, refreshToken } = signTokens(tokenPayload);
  setAuthCookies(res, accessToken, refreshToken);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: DB_TO_FRONTEND_ROLE[user.role] ?? 'pet-owner',
    },
  });
};

// Registers a new user account, hashes the password, and issues auth cookies on success.
export const signup = (pool) => async (req, res) => {
  const { fullName, email, password } = req.body ?? {};

  if (!fullName || !email || !password) {
    res.status(400).json({ error: 'Full name, email, and password are required.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  if (existing[0]) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

  await pool.execute(
    'INSERT INTO users (id, fullName, email, passwordHash, role) VALUES (?, ?, ?, ?, ?)',
    [id, fullName, email.toLowerCase(), passwordHash, 'user'],
  );

  const tokenPayload = { id, email: email.toLowerCase(), role: 'user', fullName };
  const { accessToken, refreshToken } = signTokens(tokenPayload);

  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({
    user: {
      id,
      email: email.toLowerCase(),
      fullName,
      role: 'pet-owner',
    },
  });
};

// Issues a new access and refresh token pair by validating the existing refresh token cookie.
export const refresh = () => async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    res.status(401).json({ error: 'No refresh token.' });
    return;
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_REFRESH_SECRET);
  } catch {
    clearAuthCookies(res);
    res.status(401).json({ error: 'Invalid or expired refresh token.' });
    return;
  }

  if (payload.type !== 'refresh') {
    clearAuthCookies(res);
    res.status(401).json({ error: 'Invalid token type.' });
    return;
  }

  const tokenPayload = { id: payload.id, email: payload.email, role: payload.role, fullName: payload.fullName };
  const { accessToken, refreshToken } = signTokens(tokenPayload);

  setAuthCookies(res, accessToken, refreshToken);

  res.json({
    user: {
      id: payload.id,
      email: payload.email,
      fullName: payload.fullName,
      role: DB_TO_FRONTEND_ROLE[payload.role] ?? 'pet-owner',
    },
  });
};

// Returns the currently authenticated user's profile decoded from the access token cookie.
export const me = () => async (req, res) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_ACCESS_SECRET);
  } catch {
    res.status(401).json({ error: 'Session expired.' });
    return;
  }

  if (payload.type !== 'access') {
    res.status(401).json({ error: 'Invalid token type.' });
    return;
  }

  res.json({
    user: {
      id: payload.id,
      email: payload.email,
      fullName: payload.fullName,
      role: DB_TO_FRONTEND_ROLE[payload.role] ?? 'pet-owner',
    },
  });
};

// Clears the auth cookies to end the user's session.
export const logout = () => (_req, res) => {
  clearAuthCookies(res);
  res.json({ message: 'Logged out.' });
};
