import express,{ Express,Request,Response } from "express";
import dotenv from "dotenv";
import initializeDatabase  from "./database/initialization";
import { graphqlHTTP } from 'express-graphql';
import { schema, root } from './graphql/Fact';

dotenv.config();

const app: Express = express();

app.use(express.json());

app.get('/',(req:Request,res:Response)=>{
        res.send('Hello World!');
})

async function start() {
    try {
        await initializeDatabase();

        // mount GraphQL endpoint (GraphiQL enabled in dev)
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