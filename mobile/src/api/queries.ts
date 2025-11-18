import { fetchGraphQL } from './graphql';

export async function getFaculties(department: string, designation: string, filters?: { skills?: string[]; techstacks?: string[] }) {
  const query = `
    query GetFaculties($department: String!, $designation: String!, $skills: [String], $techstacks: [String]) {
      faculties(department: $department, designation: $designation, skills: $skills, techstacks: $techstacks) {
        id
        firstname
        lastName
        email
        profilepic
        experience
        qualification
        department
        designation
        skills
        techstacks
        phone
        linkedin
      }
    }
  `;

  return fetchGraphQL(query, { 
    department, 
    designation,
    skills: filters?.skills,
    techstacks: filters?.techstacks
  });
}

export async function getFacultyById(id: string) {
  const query = `
    query GetFaculty($id: ID!) {
      faculty(id: $id) {
        id
        firstname
        lastName
        email
        profilepic
        experience
        qualification
        subjects
        department
        designation
        dob
        linkedin
        skills
        techstacks
        phone
        role
        createdAt
        updatedAt
      }
    }
  `;

  return fetchGraphQL(query, { id });
}

export async function getAllDepartments() {
  // This would need to be added to your backend
  // For now, return common departments
  return ['IT', 'CSE', 'ECE', 'Mechanical', 'Civil', 'EEE', 'Management'];
}
