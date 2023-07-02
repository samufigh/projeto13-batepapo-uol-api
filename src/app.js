import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import joi from "joi";
import dayjs from "dayjs";

//.env
dotenv.config();

//pega o horário atual
const time = dayjs().format('HH:mm:ss');

//cria e configura o servidor
const app = express();
app.use(cors());
app.use(express.json());

//cria o banco 
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

//conecta com o banco
mongoClient.connect()
    .then(() => db = mongoClient.db())
    .catch((err) => console.log(err.message));

app.post("/participants", async (req, res) => {
    try {

        const { name } = req.body;

        //body da mensagem 
        const message = {
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: time
        }

        //body do participante
        const participant = {
            name: name,
            lastStatus: Date.now()
        };
        //validações do input nome do participante
        const schemaParticipant = joi.object({
            name: joi.string().required()
        });

        const validation = schemaParticipant.validate(req.body, { abortEarly: false });

        //retorna o array de erros  
        if (validation.error) {
            const errors = validation.error.details.map(detail => detail.message);
            return res.status(422).send(errors);
        }
        const find = await db.collection("participants").findOne({
            name: name
        })
        if (find) {
            return res.sendStatus(409);
        }

        //insere o participante na collection participants no banco
        await db.collection("participants").insertOne(participant);
        await db.collection("messages").insertOne(message);

        console.log(participant);
        //envia a resposta 
        res.sendStatus(201);

    } catch (err) {
        //retorna o erro de qualquer await
        return res.status(500).send(err.message);
    }
})

app.get("/participants", async (req, res) => {
    try {
        const participants = await db.collection("participants").find().toArray();
        res.send(participants);
    } catch {
        return res.status(500).send(err.message);
    }
})

app.post("/messages", async (req, res) => {
    try {
        const {to, text, type} = req.body;
        const { user } = req.headers;

        //valida a mensagem
        const schemaMessage = joi.object({
            to: joi.string().required(),
            text: joi.string().required(),
            type: joi.valid('message', 'private_message')
        });
        const validation = schemaMessage.validate(req.body, {abortEarly: false});

        //retorna o array de erros  
        if (validation.error) {
            const errors = validation.error.details.map(detail => detail.message);
            return res.status(422).send(errors);
        }

        //body da mensagem
        const message = {
            from: user,
            to: to,
            text: text,
            type: type,
            time: time
        }

        //procura pelo usuario logado
        const find = await db.collection("participants").findOne({
            name: user
        })
        if(!find){
            return res.sendStatus(422);
        }

        //insere a mensagem no banco
        await db.collection("messages").insertOne(message)
        res.sendStatus(201);
    } catch {
        return res.status(500).send(err.message);
    }
})


app.listen(5000, () => console.log("Rodando na porta 5000"));
