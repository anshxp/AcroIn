import Student from "../schema/student";

export const student_Schema = `
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
`;

const mapId = (doc: any) => {
  if (!doc) return doc;
  const mapped = { ...doc, id: String(doc._id) };
  delete mapped._id;
  return mapped;
};

export const student = {
  students: async (args: any) => {
    const filter: any = {};
    const { department, projects, internships, competitions, certificates, skills, tech_stack } = args;

    if (department) filter.department = department;
    if (tech_stack?.length) filter.tech_stack = { $all: tech_stack };
    if (projects?.length) filter.projects = { $in: projects };
    if (internships?.length) filter.internships = { $in: internships };
    if (competitions?.length) filter.competitions = { $in: competitions };
    if (certificates?.length) filter.certificates = { $in: certificates };
    if (skills?.length) filter.skills = { $all: skills };

    return (await Student.find(filter).lean()).map(mapId);
  },

  student: async ({ id }) => mapId(await Student.findById(id).lean()),

  createStudent: async ({ input }) => mapId((await new Student(input).save()).toObject()),

  updateStudent: async ({ id, input }) =>
    mapId(await Student.findByIdAndUpdate(id, input, { new: true }).lean()),

  deleteStudent: async ({ id }) =>
    !!(await Student.findByIdAndDelete(id))
};
