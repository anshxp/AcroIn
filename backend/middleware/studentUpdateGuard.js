const EDITABLE_STUDENT_FIELDS = new Set([
  'name', 'firstname', 'firstName', 'lastName', 'lastname', 'roll', 'rollNo',
  'department', 'year', 'semester', 'phone', 'birthday', 'address', 'location',
  'bio', 'linkedin', 'github', 'portfolio', 'cgpa', 'resume', 'tech_stack',
  'skills', 'experiences', 'projects', 'certificates', 'internships', 'competitions',
  'parentInfo', 'verificationStatus', 'verifiedBy', 'verifiedAt',
]);

export const studentUpdateGuard = (req, _res, next) => {
  if (req.method !== 'PUT' || !req.body || typeof req.body !== 'object') return next();

  // Only protect the profile endpoint itself. Skill updates have their own validation.
  const pathSegments = String(req.path || '').split('/').filter(Boolean);
  if (pathSegments.length !== 1) return next();

  const sanitized = {};
  for (const [key, value] of Object.entries(req.body)) {
    if (EDITABLE_STUDENT_FIELDS.has(key)) sanitized[key] = value;
  }

  req.body = sanitized;
  next();
};
