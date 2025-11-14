import { buildSchema } from "graphql";
import Internship from "../schema/internship";

export const schema = buildSchema(`
    scalar Date

    type Internship {
        id: ID!
        company: String!
        position: String!
        duration: String!
        description: String
        certificate_link: String
        student: ID!
    }

    type Query {
        internships(student: ID): [Internship!]!
        internship(id: ID!): Internship
    }

    input InternshipInput {
        company: String!
        position: String!
        duration: String!
        description: String
        certificate_link: String
        student: ID!
    }

    type Mutation {
        createInternship(input: InternshipInput!): Internship!
        updateInternship(id: ID!, input: InternshipInput!): Internship!
        deleteInternship(id: ID!): Boolean!
    }
`);
export interface InternshipInputTS {
    company: string;
    position: string;
    duration: string;
    description?: string;
    certificate_link?: string;
    student: string;  
}
export const root = {

    
    internships: async ({ student }: { student?: string }) => {
        const filter: any = {};
        if (student) filter.student = student;
        return await Internship.find(filter).lean();
    },

    
    
    internship: async ({ id }: { id: string }) => {
        return await Internship.findById(id).lean();
    },

  
    createInternship: async ({ input }: { input: InternshipInputTS }) => {
        const doc = new Internship(input);
        const saved = await doc.save();
        return saved.toObject();
    },

    
    updateInternship: async ({ id, input }: { id: string; input: InternshipInputTS }) => {
        const updated = await Internship.findByIdAndUpdate(id, input, { new: true }).lean();
        return updated;
    },

    
    deleteInternship: async ({ id }: { id: string }) => {
        const res = await Internship.findByIdAndDelete(id);
        return !!res;
    },
};

