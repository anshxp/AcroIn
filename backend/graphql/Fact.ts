import { buildSchema } from "graphql";
import { FacultyModel } from "../schema/faculty";

export const fact_Schema = buildSchema(`
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

    type Query {
        faculties(department: String!, designation: String!,headof:String,skills:[String],techstacks:[String]): [Faculty!]!
        faculty(id: ID!): Faculty
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

    type Mutation {
        createFaculty(input: FacultyInput!): Faculty!
        updateFaculty(id: ID!, input: FacultyInput!): Faculty!
        deleteFaculty(id: ID!): Boolean!
    }
`);

export interface FacultyInput {
    firstname: string;
    lastName: string;
    email: string;
    password: string;
    profilepic?: string;
    experience: number;
    qualification: string;
    subjects?: string[];
    department: string;
    headof?: string[];
    designation: string;
    dob: string;
    linkedin?: string;
    skills?: string[];
    techstacks?: string[];
    phone: string;
    role?: string[];
}
export const faculty = {
    faculties: async ({ department, designation, headof, skills, techstacks }: { department?: string; designation?: string; headof?: string; skills?: string[]; techstacks?: string[] }) => {
        const filter: any = {};
        if (department) filter.department = department;
        if (designation) filter.designation = designation;
        if (headof) filter.headof = headof;
        if (skills && skills.length) filter.skills = { $all: skills };
        if (techstacks && techstacks.length) filter.techstacks = { $all: techstacks };
        return await FacultyModel.find(filter).lean();
    },

    faculty: async ({ id }: { id: string }) => {
        return await FacultyModel.findById(id).lean();
    },

    createFaculty: async ({ input }: { input: any }) => {
        const doc = new FacultyModel(input);
        const saved = await doc.save();
        return saved.toObject();
    },

    updateFaculty: async ({ id, input }: { id: string; input: any }) => {
        const updated = await FacultyModel.findByIdAndUpdate(id, input, { new: true }).lean();
        return updated;
    },

    deleteFaculty: async ({ id }: { id: string }) => {
        const res = await FacultyModel.findByIdAndDelete(id);
        return !!res;
    },
};
 