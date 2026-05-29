import nodemailer from 'nodemailer';

export const MFA_OTP_EXPIRY_MINUTES = 10;

// ── Helpers (also used by auth.js) ───────────────────────────────────────────

export const generateOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));

/**
 * Send an OTP email.
 * If EMAIL_HOST env var is missing (local dev without SMTP), falls back to
 * printing the code to the server console so development still works.
 */
export const sendOtpEmail = async (toEmail, otp, purpose = 'verify') => {
  const subject =
    purpose === 'login'
      ? 'VAFIS — Login verification code'
      : 'VAFIS — Enable two-factor authentication';

  // ── Debug: always log which path we're taking ────────────────────────────
  console.log('[EMAIL] sendOtpEmail called:', {
    to: toEmail,
    purpose,
    EMAIL_HOST: process.env.EMAIL_HOST ?? '(not set — will use console fallback)',
    EMAIL_PORT: process.env.EMAIL_PORT ?? '(not set)',
    EMAIL_USER: process.env.EMAIL_USER ?? '(not set)',
    EMAIL_PASS: process.env.EMAIL_PASS ? '***set***' : '(not set)',
  });

  if (!process.env.EMAIL_HOST) {
    console.log(
      `\n[DEV] MFA OTP for ${toEmail}: ${otp}  ` +
      `(expires in ${MFA_OTP_EXPIRY_MINUTES} min, purpose: ${purpose})\n`,
    );
    return;
  }

  // Use nodemailer's Gmail service preset (port 465 + SSL, handles all TLS details).
  // Falls back to manual host/port config for non-Gmail SMTP providers.
  const isGmail = (process.env.EMAIL_HOST ?? '').includes('gmail');
  const transporter = isGmail
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })
    : nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT ?? 587),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: { rejectUnauthorized: false },
      });

  // Verify SMTP connection before sending
  console.log('[EMAIL] Verifying SMTP connection…');
  await transporter.verify();
  console.log('[EMAIL] SMTP connection OK — sending…');

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? `VAFIS <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    text:
      `Your VAFIS verification code is: ${otp}\n\n` +
      `This code expires in ${MFA_OTP_EXPIRY_MINUTES} minutes. ` +
      `Do not share it with anyone.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#166534;margin-bottom:12px">VAFIS Verification Code</h2>
        <p style="color:#374151">Use the code below to complete your action:</p>
        <div style="font-size:2rem;font-weight:bold;letter-spacing:0.25em;
                    background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;
                    padding:20px;text-align:center;color:#166534;margin:20px 0">
          ${otp}
        </div>
        <p style="color:#6b7280;font-size:0.875rem">
          This code expires in ${MFA_OTP_EXPIRY_MINUTES} minutes.
          If you did not request this, please ignore this email.
        </p>
      </div>
    `,
  });

  console.log('[EMAIL] Sent successfully. Message ID:', info.messageId);
};

// ── GET /api/mfa/status ───────────────────────────────────────────────────────

export const getMfaStatus = (pool) => async (req, res) => {
  const [rows] = await pool.query(
    'SELECT mfaEnabled FROM users WHERE id = ?',
    [req.user.id],
  );
  if (!rows[0]) { res.status(404).json({ error: 'User not found.' }); return; }
  res.json({ mfaEnabled: !!rows[0].mfaEnabled });
};

// ── POST /api/mfa/enable/initiate ─────────────────────────────────────────────
// Generates an OTP, stores it in the DB, and emails it so the user can confirm
// they own the account before MFA is switched on.

export const initiateMfaEnable = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const user = rows[0];
  if (!user) { res.status(404).json({ error: 'User not found.' }); return; }

  if (user.mfaEnabled) {
    res.status(400).json({ error: 'Two-factor authentication is already enabled on this account.' });
    return;
  }

  const otp = generateOtp();

  // Let MySQL compute the expiry with its own clock — avoids Node ↔ MySQL timezone mismatch
  await pool.execute(
    `UPDATE users SET mfaOtpCode = ?, mfaOtpExpiry = NOW() + INTERVAL ${MFA_OTP_EXPIRY_MINUTES} MINUTE WHERE id = ?`,
    [otp, user.id],
  );

  try {
    await sendOtpEmail(user.email, otp, 'verify');
  } catch (err) {
    console.error('Failed to send MFA enable email:', err);
    res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
    return;
  }

  res.json({
    message:
      `A 6-digit verification code has been sent to ${user.email}. ` +
      `It expires in ${MFA_OTP_EXPIRY_MINUTES} minutes.`,
  });
};

// ── POST /api/mfa/enable/verify ───────────────────────────────────────────────
// Verifies the OTP and, if valid, flips mfaEnabled to 1.

export const verifyMfaEnable = (pool) => async (req, res) => {
  const { otp } = req.body ?? {};
  if (!otp) { res.status(400).json({ error: 'Verification code is required.' }); return; }

  // Let MySQL compare the expiry with its own NOW() — timezone-safe
  const [rows] = await pool.query(
    'SELECT *, (mfaOtpCode IS NOT NULL AND mfaOtpExpiry > NOW()) AS otpValid FROM users WHERE id = ?',
    [req.user.id],
  );
  const user = rows[0];
  if (!user) { res.status(404).json({ error: 'User not found.' }); return; }

  if (!user.mfaOtpCode) {
    res.status(400).json({ error: 'No pending verification. Please request a new code first.' });
    return;
  }

  if (!user.otpValid) {
    await pool.execute(
      'UPDATE users SET mfaOtpCode = NULL, mfaOtpExpiry = NULL WHERE id = ?',
      [user.id],
    );
    res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    return;
  }

  if (String(otp).trim() !== String(user.mfaOtpCode)) {
    res.status(400).json({ error: 'Invalid verification code.' });
    return;
  }

  await pool.execute(
    'UPDATE users SET mfaEnabled = 1, mfaOtpCode = NULL, mfaOtpExpiry = NULL WHERE id = ?',
    [user.id],
  );

  res.json({ mfaEnabled: true });
};

// ── POST /api/mfa/disable ─────────────────────────────────────────────────────

export const disableMfa = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [req.user.id]);
  if (!rows[0]) { res.status(404).json({ error: 'User not found.' }); return; }

  await pool.execute(
    'UPDATE users SET mfaEnabled = 0, mfaOtpCode = NULL, mfaOtpExpiry = NULL WHERE id = ?',
    [req.user.id],
  );

  res.json({ mfaEnabled: false });
};
