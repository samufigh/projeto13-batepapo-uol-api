import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;



mongoClient.connect()
    .then( () => db = mongoClient.db())
    .catch( (err) => console.log(err.message));

app.post("/", async(req, res) => {
    try {
        

        res.send("FUNCIONOOU");
    } catch (err) {
        return res.status(500).send(err.message);
    }
})

app.listen(5000, ()=> console.log("Rodando na porta 5000"));