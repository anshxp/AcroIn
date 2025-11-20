import Competition from "../schema/competetion";

export const comp_Schema = `
  type Competition {
    id: ID!
    name: String!
    organizer: String!
    position: String
    date: Date!
    certificate_link: String
    student: ID!
  }

  input CompetitionInput {
    name: String!
    organizer: String!
    position: String
    date: Date!
    certificate_link: String
    student: ID!
  }
`;

export const competetion = {
  competitions: async ({ student }) => {
    const filter: any = {};
    if (student) filter.student = student;
    return await Competition.find(filter).lean();
  },

  competition: async ({ id }) =>
    await Competition.findById(id).lean(),

  createCompetition: async ({ input }) => {
    const saved = await new Competition(input).save();
    return saved.toObject();
  },

  updateCompetition: async ({ id, input }) =>
    await Competition.findByIdAndUpdate(id, input, { new: true }).lean(),

  deleteCompetition: async ({ id }) =>
    !!(await Competition.findByIdAndDelete(id))
};
