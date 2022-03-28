const express = require('express')
const mongoose = require('mongoose')
const authRouter = require('./authRouter')
const path = require("path");
const PORT = process.env.PORT || 5000

const app = express()

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));
app.use('/auth', authRouter)

const run = async () => {
    try {
        mongoose.connect('mongodb+srv://hywerq:kuroshitsuji@cluster0.qjshh.mongodb.net/SPP_L1_DB')
            .catch(err => console.log(err))

        app.listen(PORT, () => { console.log('Server has been started...') })
    }
    catch (err) {
        console.log(err)
    }
}

run()