require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')

const app = express()

const authRoutes = require('./routes/auth')
const personRoutes = require('./routes/person')

//MIDDLEWARES - JASON
app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(express.json())


app.get('/', (rep, res) => {
    res.json({message: 'Welcome to NodeJS!'});
})

app.use('/auth', authRoutes);
app.use('/person', personRoutes);


const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_BASE = process.env.DB_BASE
const DB_URL = process.env.DB_URL


mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_URL}/${DB_BASE}`)
.then(() => {
    console.log("Conectado ao MongoDB");
    app.listen(3000)
}).catch((err) => {
    console.log("Erro: " + err);
});















