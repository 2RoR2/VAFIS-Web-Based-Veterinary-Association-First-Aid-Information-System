import jwt from 'jsonwebtoken';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'vafis-dev-access-secret-change-in-production';

/**
 * Enforces authentication on a route. Reads the accessToken httpOnly cookie,
 * verifies the JWT signature, and attaches the decoded payload to req.user.
 * Responds 401 if the token is missing, invalid, or expired.
 */
export const requireAuth = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET);
    if (payload.type !== 'access') {
      res.status(401).json({ error: 'Invalid token.' });
      return;
    }
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Session expired.' });
  }
};

/**
 * Middleware factory that enforces role-based access control.
 * Must follow requireAuth so req.user is already populated.
 * Responds 403 if the authenticated user's role is not in the allowed list.
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  if (!roles.includes(req.user.role)) {
    res.status(403).json({ error: 'Insufficient permissions.' });
    return;
  }
  next();
};

/**
 * Attaches the authenticated user to req.user when a valid accessToken cookie is present,
 * but does not block unauthenticated requests. Used on routes that serve different content
 * depending on whether the caller is logged in.
 */
export const optionalAuth = (req, _res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) { next(); return; }

  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET);
    if (payload.type === 'access') req.user = payload;
  } catch {
    // invalid / expired - treat as unauthenticated
  }
  next();
};
