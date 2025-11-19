import { buildSchema } from "graphql";
import Student from "../schema/student";


export const student_Schema = buildSchema(`

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
    createdAt: String
    updatedAt: String
  }


  type Query {
    students(department: String, projects: [String], internships: [String], competitions: [String], certificates: [String], skills: [String], tech_stack: [String]): [Student!]!
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


const mapId = (doc: any) => {
  if (!doc) return doc;
  const mapped = { ...doc, id: doc._id ? String(doc._id) : undefined };
  if (mapped._id) delete mapped._id;
  return mapped;
};

export const student = {
  students: async (args: { department?: string; projects?: string[]; internships?: string[]; competitions?: string[]; certificates?: string[]; skills?: string[]; tech_stack?: string[] }) => {
    const { department, projects, internships, competitions, certificates, skills, tech_stack } = args || {};
    const filter: any = {};

    if (department) filter.department = department;
    if (tech_stack && tech_stack.length) filter.tech_stack = { $all: tech_stack };
    if (projects && projects.length) filter.projects = { $in: projects };
    if (internships && internships.length) filter.internships = { $in: internships };
    if (competitions && competitions.length) filter.competitions = { $in: competitions };
    if (certificates && certificates.length) filter.certificates = { $in: certificates };
    if (skills && skills.length) filter.skills = { $all: skills };

    const docs = await Student.find(filter).lean();
    return docs.map(mapId);
  },

  student: async ({ id }: { id: string }) => {
    const doc = await Student.findById(id).lean();
    return mapId(doc);
  },

  createStudent: async ({ input }: { input: StudentInput }) => {
    const newStudent = new Student(input);
    const saved = await newStudent.save();
    const obj = saved.toObject ? saved.toObject() : saved;
    return mapId(obj);
  },

  updateStudent: async ({ id, input }: { id: string; input: StudentInput }) => {
    const updated = await Student.findByIdAndUpdate(id, input, { new: true }).lean();
    if (!updated) throw new Error("Student not found");
    return mapId(updated);
  },

  deleteStudent: async ({ id }: { id: string }) => {
    const res = await Student.findByIdAndDelete(id);
    return !!res;
  },
};
