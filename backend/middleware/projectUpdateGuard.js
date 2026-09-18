const EDITABLE_PROJECT_FIELDS = new Set([
  'title',
  'description',
  'technologies',
  'github_link',
  'live_link',
]);

export const projectUpdateGuard = (req, _res, next) => {
  if (req.method !== 'PUT' || !req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return next();
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(req.body)) {
    if (EDITABLE_PROJECT_FIELDS.has(key)) sanitized[key] = value;
  }

  req.body = sanitized;
  return next();
};
