import Certificate from "../schema/certificate";

export const cert_Schema = `
  type Certificate {
    id: ID!
    title: String!
    organization: String!
    issue_date: Date!
    certificate_link: String
    student: ID!
  }

  input CertificateInput {
    title: String!
    organization: String!
    issue_date: Date!
    certificate_link: String
    student: ID!
  }
`;

export const certificate = {
  certificates: async ({ student }) => {
    const filter: any = {};
    if (student) filter.student = student;
    return await Certificate.find(filter).lean();
  },

  certificate: async ({ id }) => {
    return await Certificate.findById(id).lean();
  },

  createCertificate: async ({ input }) => {
    const saved = await new Certificate(input).save();
    return saved.toObject();
  },

  updateCertificate: async ({ id, input }) =>
    await Certificate.findByIdAndUpdate(id, input, { new: true }).lean(),

  deleteCertificate: async ({ id }) =>
    !!(await Certificate.findByIdAndDelete(id))
};
