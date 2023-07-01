import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("FUNCIONOOU");
})

app.listen(5000, ()=> console.log("Rodando na porta 5000"));