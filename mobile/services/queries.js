// services/queries.js
import { gql } from '@apollo/client';

export const LOGIN = gql`mutation Login($email:String!, $password:String!){ login(email:$email,password:$password){ token user { id name email role department } } }`;
export const REGISTER = gql`mutation Register($name:String!,$email:String!,$password:String!,$role:Role!){ register(name:$name,email:$email,password:$password,role:$role){ token user { id name email role department } } }`;
export const GET_COMPETITIONS = gql`query{ getCompetitions { id title description } }`;
export const GET_UNVERIFIED = gql`query{ getUnverifiedStudents { id name email department } }`;
export const GET_ALL_STUDENTS = gql`query{ getAllStudents { id name email department } }`;
export const GET_ALL_FACULTY = gql`query{ getAllFaculty { id name email department } }`;
export const GET_STU_PROJECTS = gql`query StuProjects($id:ID!){ getStudentProjects(id:$id){ id title description verified } }`;
export const GET_STU_SKILLS = gql`query StuSkills($id:ID!){ getStudentSkills(id:$id){ id name } }`;
