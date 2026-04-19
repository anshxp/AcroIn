export const SKILL_CATALOG: Record<string, string[]> = {
  'Programming Languages': ['JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'Go', 'Rust'],
  'Web Development': ['React', 'Node.js', 'Express.js', 'Next.js', 'HTML', 'CSS', 'Tailwind CSS'],
  'Data & AI': ['Machine Learning', 'Deep Learning', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Data Analysis'],
  'Cloud & DevOps': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
  'Databases': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase'],
  'Cyber Security': ['Network Security', 'Ethical Hacking', 'OWASP', 'Penetration Testing', 'SIEM'],
  'Core CS': ['Data Structures', 'Algorithms', 'Operating Systems', 'Computer Networks', 'DBMS'],
  'Design & Product': ['Figma', 'UI Design', 'UX Research', 'Wireframing', 'Prototyping'],
};

export const SKILL_CATEGORIES = Object.keys(SKILL_CATALOG);
