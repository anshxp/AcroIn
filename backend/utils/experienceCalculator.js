/**
 * Calculate faculty experience in years based on dateOfJoining
 * @param {Date|string} dateOfJoining - The date when faculty joined
 * @returns {number} - Years of experience
 */
export const calculateExperience = (dateOfJoining) => {
  if (!dateOfJoining) return 0;

  const joinDate = new Date(dateOfJoining);
  const today = new Date();

  // Calculate difference in milliseconds
  const timeDiff = today - joinDate;

  // Convert to years
  const years = timeDiff / (1000 * 60 * 60 * 24 * 365.25);

  // Return as integer (full years)
  return Math.floor(Math.max(0, years));
};

/**
 * Enrich faculty object with calculated experience
 * @param {Object} faculty - Faculty document
 * @returns {Object} - Faculty object with calculated experience
 */
export const enrichFacultyWithCalculatedExperience = (faculty) => {
  if (!faculty) return faculty;

  const facultyObj = typeof faculty.toObject === 'function' ? faculty.toObject() : { ...faculty };
  
  // Override experience with calculated value if dateOfJoining exists
  if (facultyObj.dateOfJoining) {
    facultyObj.experience = calculateExperience(facultyObj.dateOfJoining);
    facultyObj.calculatedExperience = true; // Flag to indicate it was calculated
  }

  return facultyObj;
};

/**
 * Enrich multiple faculty documents with calculated experience
 * @param {Array} faculties - Array of faculty documents
 * @returns {Array} - Array of faculty objects with calculated experience
 */
export const enrichFacultiesWithCalculatedExperience = (faculties) => {
  if (!Array.isArray(faculties)) return faculties;
  return faculties.map(f => enrichFacultyWithCalculatedExperience(f));
};
