// User types
export interface StudentSkill {
  _id?: string;
  category?: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  verified: boolean;
  endorsements: number;
  progress: number;
}

export interface StudentExperience {
  _id?: string;
  title: string;
  company: string;
  duration: string;
  type: string;
  verified: boolean;
}

export interface Student {
  _id: string;
  name: string;
  roll: string;
  email: string;
  department: string;
  year?: string;
  semester?: string;
  phone?: string;
  birthday?: string;
  address?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  location?: string;
  bio?: string;
  tech_stack: string[];
  profile_image?: string;
  cover_image?: string;
  skills?: StudentSkill[];
  experiences?: StudentExperience[];
  profileCompleteness?: number;
  faceVerificationStatus?: 'none' | 'partial' | 'complete';
  verificationStatus?: 'not_verified' | 'verified' | 'strongly_verified';
  verifiedBy?: string;
  verifiedAt?: string;
  status?: 'active' | 'inactive';
  projects: Project[];
  internships: Internship[];
  competitions: Competition[];
  certificates: Certificate[];
  createdAt: string;
  updatedAt: string;
}

export interface Faculty {
  _id: string;
  firstname: string;
  lastName: string;
  email: string;
  profilepic?: string;
  experience: number;
  qualification: string;
  subjects: string[];
  department: string;
  headof: string[];
  designation: string;
  dob: string;
  linkedin?: string;
  skills: string[];
  techstacks: string[];
  phone: string;
  role: ('faculty' | 'dept_admin' | 'super_admin')[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  github_link?: string;
  live_link?: string;
  student: string;
  createdAt: string;
  updatedAt: string;
}

export interface Internship {
  _id: string;
  company: string;
  position: string;
  duration: string;
  description?: string;
  certificate_link?: string;
  application_link?: string;
  student: string;
  createdAt: string;
  updatedAt: string;
}

export interface Competition {
  _id: string;
  name: string;
  organizer: string;
  position?: string;
  date: string;
  certificate_link?: string;
  application_link?: string;
  student: string;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  _id: string;
  title: string;
  organization: string;
  issue_date: string;
  certificate_link?: string;
  student: string;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  _id: string;
  title: string;
  type: 'internship' | 'job' | 'competition' | 'workshop' | 'certification';
  company?: string;
  location?: string;
  eventDate?: string;
  deadline?: string;
  description: string;
  requirements: string[];
  application_link: string;
  attachments?: string[];
  isActive: boolean;
  createdBy: string;
  createdByRole: 'faculty' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  user: string;
  message: string;
  type: 'alert' | 'message' | 'profile_view' | 'system' | 'certificate';
  read: boolean;
  sourceType?: 'competition' | 'internship' | 'certificate' | 'opportunity' | 'post' | 'system';
  sourceId?: string;
  sourceTitle?: string;
  actionPath?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface StudentRegisterData {
  name: string;
  roll: string;
  email: string;
  password: string;
  department: string;
}

export interface FacultyRegisterData {
  firstname: string;
  lastName: string;
  email: string;
  password: string;
  department: string;
  designation: string;
  qualification: string;
  experience: number;
  phone: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Student | Faculty;
  userType?: 'student' | 'faculty' | 'admin';
}

export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'student' | 'faculty' | 'admin';
  role?: string[];
  // Faculty-specific fields
  firstname?: string;
  lastName?: string;
  department?: string;
  designation?: string;
}

// Post types (LinkedIn-style)
export interface Post {
  _id: string;
  author: {
    _id: string;
    name: string;
    designation?: string;
    department?: string;
    profileImage?: string;
    userType: 'faculty' | 'admin';
  };
  content: string;
  images?: string[];
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  author: {
    _id: string;
    name: string;
    profileImage?: string;
    userType: 'student' | 'faculty' | 'admin';
  };
  content: string;
  createdAt: string;
}

export interface CreatePostData {
  content: string;
  images?: string[];
  files?: File[];
}
