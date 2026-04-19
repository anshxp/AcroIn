import AuditLog from '../models/AuditLog.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const OMITTED_KEYS = new Set(['password', 'token', 'authorization']);

const sanitizePayload = (value) => {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 10).map((item) => sanitizePayload(item));
  }

  const sanitized = {};
  for (const [key, entry] of Object.entries(value)) {
    if (OMITTED_KEYS.has(String(key).toLowerCase())) {
      sanitized[key] = '***';
      continue;
    }

    if (typeof entry === 'object' && entry !== null) {
      sanitized[key] = sanitizePayload(entry);
    } else {
      sanitized[key] = entry;
    }
  }

  return sanitized;
};

const resolveActor = async (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  let tokenPayload = null;

  if (token) {
    try {
      tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      tokenPayload = null;
    }
  }

  const actorId = req.user?.id || tokenPayload?.id;
  const actorUserType = String(req.user?.userType || tokenPayload?.userType || '').trim().toLowerCase();

  if (!actorId || !actorUserType) {
    return null;
  }

  const user = await User.findById(actorId).select('role userType');
  const roleList = Array.isArray(user?.role) ? user.role.map((role) => String(role || '').trim().toLowerCase()) : [];

  let actorRole = actorUserType;
  if (roleList.includes('super_admin')) {
    actorRole = 'super_admin';
  } else if (roleList.includes('dept_admin')) {
    actorRole = 'dept_admin';
  } else if (user?.userType) {
    actorRole = String(user.userType).trim().toLowerCase();
  }

  return {
    actorId,
    actorRole,
  };
};

export const auditLogger = (req, res, next) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    if (req.method === 'OPTIONS') {
      return;
    }

    void (async () => {
      const actor = await resolveActor(req);
      if (!actor) return;

      const auditableRoles = new Set(['faculty', 'admin', 'dept_admin', 'super_admin']);
      if (!auditableRoles.has(actor.actorRole)) {
        return;
      }

      const payload = sanitizePayload(req.body);
      const success = res.statusCode >= 200 && res.statusCode < 400;

      await AuditLog.create({
        actorId: actor.actorId,
        actorRole: actor.actorRole,
        action: `${req.method} ${req.baseUrl || ''}${req.path || ''}`.trim(),
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        success,
        ip: req.ip,
        userAgent: req.get('user-agent') || '',
        payload: {
          params: sanitizePayload(req.params),
          query: sanitizePayload(req.query),
          body: payload,
          durationMs: Date.now() - startedAt,
        },
      });
    })().catch(() => {
      // Avoid blocking user flow if audit logging fails.
    });
  });

  next();
};

export default auditLogger;
