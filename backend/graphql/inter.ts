import Internship from "../schema/internship";

export const intern_Schema = `
  type Internship {
    id: ID!
    company: String!
    position: String!
    duration: String!
    description: String
    certificate_link: String
    student: ID!
  }

  input InternshipInput {
    company: String!
    position: String!
    duration: String!
    description: String
    certificate_link: String
    student: ID!
  }
`;

export const internship = {
  internships: async ({ student }) => {
    const filter: any = {};
    if (student) filter.student = student;
    return await Internship.find(filter).lean();
  },

  internship: async ({ id }) =>
    await Internship.findById(id).lean(),

  createInternship: async ({ input }) =>
    (await new Internship(input).save()).toObject(),

  updateInternship: async ({ id, input }) =>
    await Internship.findByIdAndUpdate(id, input, { new: true }).lean(),

  deleteInternship: async ({ id }) =>
    !!(await Internship.findByIdAndDelete(id))
};
