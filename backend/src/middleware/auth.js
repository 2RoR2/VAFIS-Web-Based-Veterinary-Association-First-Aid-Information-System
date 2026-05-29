import jwt from 'jsonwebtoken';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'vafis-dev-access-secret-change-in-production';

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

// Attach user if cookie present, but do not block unauthenticated requests
export const optionalAuth = (req, _res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) { next(); return; }

  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET);
    if (payload.type === 'access') req.user = payload;
  } catch {
    // invalid / expired — treat as unauthenticated
  }
  next();
};
