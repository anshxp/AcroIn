import express,{ Express,Request,Response } from "express";
import dotenv from "dotenv";
import initializeDatabase  from "./database/initialization";
import { graphqlHTTP } from 'express-graphql';
import { fact_Schema, faculty } from './graphql/Fact';
import { student_Schema, student } from './graphql/Stu';
import { comp_Schema, competetion } from './graphql/comp';
import { cert_Schema, certificate } from './graphql/cert';
import { intern_Schema, internship } from './graphql/inter';
import { buildSchema } from "graphql";


dotenv.config();

const app: Express = express();

app.use(express.json());

app.get('/',(req:Request,res:Response)=>{
        res.send('Hello World!');
})

const schema=buildSchema(`
    ${fact_Schema},
    ${student_Schema},
    ${comp_Schema},
    ${cert_Schema},
    ${intern_Schema},
`)

const root={
    ...faculty,
    ...student,
    ...competetion,
    ...certificate,
    ...internship
}

async function start() {
    try {
        await initializeDatabase();

        app.use('/graphql', graphqlHTTP({ schema, rootValue: root, graphiql: true }));

        const PORT = process.env.PORT;
        app.listen(PORT, () => {
            console.log(`Backend listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
}

start();