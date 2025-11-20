import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import initializeDatabase from "./database/initialization";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";

import { fact_Schema, faculty } from "./graphql/Fact";
import { student_Schema, student } from "./graphql/Stu";
import { comp_Schema, competetion } from "./graphql/comp";
import { cert_Schema, certificate } from "./graphql/cert";
import { intern_Schema, internship } from "./graphql/inter";

dotenv.config();
const app: Express = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

const schema = buildSchema(`
  scalar Date

  ${fact_Schema}
  ${student_Schema}
  ${comp_Schema}
  ${cert_Schema}
  ${intern_Schema}

  # SINGLE ROOT QUERY
  type Query {
    faculties(
      department: String
      designation: String
      headof: String
      skills: [String]
      techstacks: [String]
    ): [Faculty!]!
    faculty(id: ID!): Faculty

    students(
      department: String
      projects: [String]
      internships: [String]
      competitions: [String]
      certificates: [String]
      skills: [String]
      tech_stack: [String]
    ): [Student!]!
    student(id: ID!): Student

    competitions(student: ID): [Competition!]!
    competition(id: ID!): Competition

    certificates(student: ID): [Certificate!]!
    certificate(id: ID!): Certificate

    internships(student: ID): [Internship!]!
    internship(id: ID!): Internship
  }

  # SINGLE ROOT MUTATION
  type Mutation {
    createFaculty(input: FacultyInput!): Faculty!
    updateFaculty(id: ID!, input: FacultyInput!): Faculty!
    deleteFaculty(id: ID!): Boolean!

    createStudent(input: StudentInput!): Student!
    updateStudent(id: ID!, input: StudentInput!): Student!
    deleteStudent(id: ID!): Boolean!

    createCompetition(input: CompetitionInput!): Competition!
    updateCompetition(id: ID!, input: CompetitionInput!): Competition!
    deleteCompetition(id: ID!): Boolean!

    createCertificate(input: CertificateInput!): Certificate!
    updateCertificate(id: ID!, input: CertificateInput!): Certificate!
    deleteCertificate(id: ID!): Boolean!

    createInternship(input: InternshipInput!): Internship!
    updateInternship(id: ID!, input: InternshipInput!): Internship!
    deleteInternship(id: ID!): Boolean!
  }
`);

const root = {
  ...faculty,
  ...student,
  ...competetion,
  ...certificate,
  ...internship,
};

async function start() {
  try {
    await initializeDatabase();

    app.use(
      "/graphql",
      graphqlHTTP({
        schema,
        rootValue: root,
        graphiql: true
      })
    );

    app.listen(process.env.PORT, () => {
      console.log(`Backend listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error);
  }
}

start();
