import { buildSchema } from "graphql";
import Student from "../schema/student"; 


export const schema = buildSchema(`

  type Student {
    id: ID!
    name: String!
    roll: String!
    email: String!
    department: String!
    tech_stack: [String!]!
    profile_image: String
    face_encoding: [Float]
    projects: [ID!]     
    internships: [ID!]
    competitions: [ID!]
    certificates: [ID!]
    createdAt: String!
    updatedAt: String!
  }


  type Query {
    
    students(department: String, tech_stack: [String]): [Student!]!

  
    student(id: ID!): Student
  }

  
  input StudentInput {
    name: String!
    roll: String!
    email: String!
    department: String!
    tech_stack: [String!]
    profile_image: String
    face_encoding: [Float]
    projects: [ID!]
    internships: [ID!]
    competitions: [ID!]
    certificates: [ID!]
  }

  
  type Mutation {
    createStudent(input: StudentInput!): Student!
    updateStudent(id: ID!, input: StudentInput!): Student!
    deleteStudent(id: ID!): Boolean!
  }
`);



export interface StudentInput {
  name: string;
  roll: string;
  email: string;
  department: string;
  tech_stack?: string[];
  profile_image?: string;
  face_encoding?: number[];
  projects?: string[];
  internships?: string[];
  competitions?: string[];
  certificates?: string[];
}


export const root = {
  
  students: async ({ department, tech_stack }: { department?: string; tech_stack?: string[] }) => {
    const filter: any = {};
    if (department) filter.department = department;
    if (tech_stack && tech_stack.length) filter.tech_stack = { $all: tech_stack };

    return await Student.find(filter).lean();
  },

  
  student: async ({ id }: { id: string }) => {
    return await Student.findById(id).lean();
  },

  
  createStudent: async ({ input }: { input: StudentInput }) => {
    const newStudent = new Student(input);
    const saved = await newStudent.save();
    return saved.toObject();
  },

 
  updateStudent: async ({ id, input }: { id: string; input: StudentInput }) => {
    const updated = await Student.findByIdAndUpdate(id, input, { new: true }).lean();
    return updated;
  },

  
  deleteStudent: async ({ id }: { id: string }) => {
    const res = await Student.findByIdAndDelete(id);
    return !!res;
  },
};
