import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"

import { loginValidation, registerValidation } from "./validations.js"

import checkAuth from "./utils/checkAuth.js"

import * as UserController from "./controllers/UserController.js"

dotenv.config()

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("DB ok"))
    .catch((err) => console.log("DB error", err))


const app = express()

app.use(express.json()) //without this will be undefined in req.body

app.get("/", (req, res) => {
    res.send("Hello World!")
})

app.post("/auth/login", loginValidation, UserController.login)
app.post("/auth/register", registerValidation, UserController.register)
app.get("/auth/me", checkAuth, UserController.getMe)

app.listen(4444, (err) => {
    if (err) {
        return console.log(err)
    }

    console.log("Server OK")
})