const EDITABLE_OPPORTUNITY_FIELDS = new Set([
  'title',
  'type',
  'company',
  'location',
  'eventDate',
  'deadline',
  'description',
  'requirements',
  'application_link',
  'attachments',
]);

export const opportunityUpdateGuard = (req, _res, next) => {
  if (req.method !== 'PUT' || !req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return next();
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(req.body)) {
    if (EDITABLE_OPPORTUNITY_FIELDS.has(key)) sanitized[key] = value;
  }

  req.body = sanitized;
  return next();
};
