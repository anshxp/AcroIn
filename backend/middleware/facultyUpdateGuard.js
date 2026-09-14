const EDITABLE_FACULTY_FIELDS = new Set([
  'firstname',
  'lastName',
  'email',
  'profilepic',
  'experience',
  'dateOfJoining',
  'qualification',
  'subjects',
  'department',
  'headof',
  'designation',
  'dob',
  'linkedin',
  'skills',
  'techstacks',
  'phone',
]);

export const facultyUpdateGuard = (req, _res, next) => {
  if (req.method !== 'PUT' || !req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return next();
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(req.body)) {
    if (EDITABLE_FACULTY_FIELDS.has(key)) sanitized[key] = value;
  }

  req.body = sanitized;
  return next();
};
