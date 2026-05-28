import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'vafis-dev-access-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'vafis-dev-refresh-secret-change-in-production';
const IS_PROD = process.env.NODE_ENV === 'production';

const signTokens = (payload) => ({
  accessToken: jwt.sign({ ...payload, type: 'access' }, JWT_ACCESS_SECRET, { expiresIn: '5m' }),
  refreshToken: jwt.sign({ ...payload, type: 'refresh' }, JWT_REFRESH_SECRET, { expiresIn: '7d' }),
});

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true, secure: IS_PROD, sameSite: 'lax', maxAge: 5 * 60 * 1000, path: '/',
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, secure: IS_PROD, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/',
  });
};

const DB_TO_FRONTEND_ROLE = {
  user: 'pet-owner',
  professional: 'veterinary-professional',
  admin: 'administrator',
};

// PUT /api/user/profile
export const updateProfile = (pool) => async (req, res) => {
  const { fullName, email } = req.body ?? {};

  if (!fullName?.trim() && !email?.trim()) {
    res.status(400).json({ error: 'At least one of fullName or email is required.' });
    return;
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const user = rows[0];
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const newFullName = fullName?.trim() || user.fullName;
  const newEmail = email?.trim().toLowerCase() || user.email;

  if (newEmail !== user.email) {
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [newEmail, user.id],
    );
    if (existing[0]) {
      res.status(409).json({ error: 'This email is already in use by another account.' });
      return;
    }
  }

  await pool.execute(
    'UPDATE users SET fullName = ?, email = ? WHERE id = ?',
    [newFullName, newEmail, user.id],
  );

  // Re-issue tokens so the JWT payload reflects the new name/email immediately
  const tokenPayload = { id: user.id, email: newEmail, role: user.role, fullName: newFullName };
  const { accessToken, refreshToken } = signTokens(tokenPayload);
  setAuthCookies(res, accessToken, refreshToken);

  res.json({
    user: {
      id: user.id,
      fullName: newFullName,
      email: newEmail,
      role: DB_TO_FRONTEND_ROLE[user.role] ?? 'pet-owner',
    },
  });
};

// PUT /api/user/password
export const changePassword = (pool) => async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'currentPassword and newPassword are required.' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters.' });
    return;
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const user = rows[0];
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Current password is incorrect.' });
    return;
  }

  const sameAsOld = await bcrypt.compare(newPassword, user.passwordHash);
  if (sameAsOld) {
    res.status(400).json({ error: 'New password must be different from the current password.' });
    return;
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.execute('UPDATE users SET passwordHash = ? WHERE id = ?', [newHash, user.id]);

  res.json({ message: 'Password updated successfully.' });
};
