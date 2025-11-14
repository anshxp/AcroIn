import { buildSchema } from "graphql";
import Competition from "../schema/competetion";

export const schema = buildSchema(`
    scalar Date

    type Competition {
        id: ID!
        name: String!
        organizer: String!
        position: String
        date: Date!
        certificate_link: String
        student: ID!
    }

    type Query {
        competitions(student: ID): [Competition!]!
        competition(id: ID!): Competition
    }

    input CompetitionInput {
        name: String!
        organizer: String!
        position: String
        date: Date!
        certificate_link: String
        student: ID!
    }

    type Mutation {
        createCompetition(input: CompetitionInput!): Competition!
        updateCompetition(id: ID!, input: CompetitionInput!): Competition!
        deleteCompetition(id: ID!): Boolean!
    }
`);
export interface CompetitionInputTS {
    name: string;
    organizer: string;
    position?: string;
    date: Date;
    certificate_link?: string;
    student: string;   
}
export const root = {

    competitions: async ({ student }: { student?: string }) => {
        const filter: any = {};
        if (student) filter.student = student;
        return await Competition.find(filter).lean();
    },

    
    competition: async ({ id }: { id: string }) => {
        return await Competition.findById(id).lean();
    },

    createCompetition: async ({ input }: { input: CompetitionInputTS }) => {
        const doc = new Competition(input);
        const saved = await doc.save();
        return saved.toObject();
    },

    updateCompetition: async ({ id, input }: { id: string; input: CompetitionInputTS }) => {
        const updated = await Competition.findByIdAndUpdate(id, input, { new: true }).lean();
        return updated;
    },

   
    deleteCompetition: async ({ id }: { id: string }) => {
        const res = await Competition.findByIdAndDelete(id);
        return !!res;
    },
};

