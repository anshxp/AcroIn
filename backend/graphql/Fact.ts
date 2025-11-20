import { FacultyModel } from "../schema/faculty";

export const fact_Schema = `
  type Faculty {
    id: ID!
    firstname: String!
    lastName: String!
    email: String!
    profilepic: String
    experience: Int!
    qualification: String!
    subjects: [String!]!
    department: String!
    headof: [String!]!
    designation: String!
    dob: String!
    linkedin: String
    skills: [String!]!
    techstacks: [String!]!
    phone: String!
    role: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  input FacultyInput {
    firstname: String!
    lastName: String!
    email: String!
    password: String!
    profilepic: String
    experience: Int!
    qualification: String!
    subjects: [String!]
    department: String!
    headof: [String!]
    designation: String!
    dob: String!
    linkedin: String
    skills: [String!]
    techstacks: [String!]
    phone: String!
    role: [String!]
  }
`;

export const faculty = {
  faculties: async (args: any) => {
    const filter: any = {};
    const { department, designation, headof, skills, techstacks } = args;

    if (department) filter.department = department;
    if (designation) filter.designation = designation;
    if (headof) filter.headof = headof;
    if (skills?.length) filter.skills = { $all: skills };
    if (techstacks?.length) filter.techstacks = { $all: techstacks };

    return await FacultyModel.find(filter).lean();
  },

  faculty: async ({ id }) => await FacultyModel.findById(id).lean(),

  createFaculty: async ({ input }) =>
    (await new FacultyModel(input).save()).toObject(),

  updateFaculty: async ({ id, input }) =>
    await FacultyModel.findByIdAndUpdate(id, input, { new: true }).lean(),

  deleteFaculty: async ({ id }) =>
    !!(await FacultyModel.findByIdAndDelete(id))
};
