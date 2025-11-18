import { buildSchema } from "graphql";
import Certificate from "../schema/certificate";

export const cert_Schema = buildSchema(`
    scalar Date

    type Certificate {
        id: ID!
        title: String!
        organization: String!
        issue_date: Date!
        certificate_link: String
        student: ID!
    }

    type Query {
        certificates(student: ID): [Certificate!]!
        certificate(id: ID!): Certificate
    }

    input CertificateInput {
        title: String!
        organization: String!
        issue_date: Date!
        certificate_link: String
        student: ID!
    }

    type Mutation {
        createCertificate(input: CertificateInput!): Certificate!
        updateCertificate(id: ID!, input: CertificateInput!): Certificate!
        deleteCertificate(id: ID!): Boolean!
    }
`);
export interface CertificateInputTS {
    title: string;
    organization: string;
    issue_date: Date;
    certificate_link?: string;
    student: string;   
}

export const certificate = {
   
    certificates: async ({ student }: { student?: string }) => {
        const filter: any = {};
        if (student) filter.student = student;
        return await Certificate.find(filter).lean();
    },

    certificate: async ({ id }: { id: string }) => {
        return await Certificate.findById(id).lean();
    },

    
    createCertificate: async ({ input }: { input: any }) => {
        const doc = new Certificate(input);
        const saved = await doc.save();
        return saved.toObject();
    },

    
    updateCertificate: async ({ id, input }: { id: string; input: any }) => {
        const updated = await Certificate.findByIdAndUpdate(id, input, { new: true }).lean();
        return updated;
    },

    
    deleteCertificate: async ({ id }: { id: string }) => {
        const res = await Certificate.findByIdAndDelete(id);
        return !!res;
    },
};
