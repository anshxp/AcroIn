import express,{ Express,Request,Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();

app.get('/',(req:Request,res:Response)=>{
        res.send('Hello World!');
})

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
});