import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import mongoose from "mongoose"
import { validationResult } from "express-validator"
import dotenv from "dotenv"
dotenv.config()

import { registerValidation } from "./validations/auth.js"

import UserModel from "./models/User.js"

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("DB ok"))
    .catch((err) => console.log("DB error", err))


const app = express()

app.use(express.json()) //without this will be undefined in req.body

app.get("/", (req, res) => {
    res.send("Hello World!")
})

app.post("/auth/register", registerValidation, async (req, res) => {
    try {
        const { email, fullName, avatarUrl } = req.body
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array())
        }
        const password = req.body.password
        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, salt)

        const doc = new UserModel({
            email,
            fullName,
            avatarUrl,
            passwordHash
        })
        const user = await doc.save()
        res.json(user)
    } catch (err) {
        console.log("err=>", err)
        res.status(500).json({
            message: "registration failed",
        })
    }
})

app.listen(4444, (err) => {
    if (err) {
        return console.log(err)
    }

    console.log("Server OK")
})