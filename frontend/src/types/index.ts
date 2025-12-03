// User types
export interface Student {
  _id: string;
  name: string;
  roll: string;
  email: string;
  department: string;
  tech_stack: string[];
  profile_image?: string;
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
}
