const EDITABLE_STUDENT_FIELDS = new Set([
  'name', 'firstname', 'firstName', 'lastName', 'lastname', 'roll', 'rollNo',
  'department', 'year', 'semester', 'phone', 'birthday', 'address', 'location',
  'bio', 'linkedin', 'github', 'portfolio', 'cgpa', 'resume', 'tech_stack',
  'skills', 'experiences', 'projects', 'certificates', 'internships', 'competitions',
  'parentInfo',
]);

const sanitizeSkills = (skills) => Array.isArray(skills)
  ? skills.map((skill) => ({
      category: skill?.category,
      name: skill?.name,
      level: skill?.level,
    }))
  : skills;

const sanitizeExperiences = (experiences) => Array.isArray(experiences)
  ? experiences.map((experience) => ({
      title: experience?.title,
      company: experience?.company,
      duration: experience?.duration,
      type: experience?.type,
    }))
  : experiences;

const sanitizeParentInfo = (parentInfo) => {
  if (!parentInfo || typeof parentInfo !== 'object' || Array.isArray(parentInfo)) return parentInfo;
  const allowed = ['fatherName', 'fatherPhone', 'fatherEmail', 'motherName', 'motherPhone', 'motherEmail'];
  return Object.fromEntries(
    allowed
      .filter((key) => Object.prototype.hasOwnProperty.call(parentInfo, key))
      .map((key) => [key, parentInfo[key]])
  );
};

export const studentUpdateGuard = (req, _res, next) => {
  if (req.method !== 'PUT' || !req.body || typeof req.body !== 'object') return next();

  // Only protect the profile endpoint itself. Skill updates have their own validation.
  const pathSegments = String(req.path || '').split('/').filter(Boolean);
  if (pathSegments.length !== 1) return next();

  const sanitized = {};
  for (const [key, value] of Object.entries(req.body)) {
    if (!EDITABLE_STUDENT_FIELDS.has(key)) continue;
    if (key === 'skills') sanitized[key] = sanitizeSkills(value);
    else if (key === 'experiences') sanitized[key] = sanitizeExperiences(value);
    else if (key === 'parentInfo') sanitized[key] = sanitizeParentInfo(value);
    else sanitized[key] = value;
  }

  req.body = sanitized;
  next();
};
