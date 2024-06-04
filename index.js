import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import mongoose from "mongoose"
import { validationResult } from "express-validator"
import dotenv from "dotenv"
dotenv.config()

import { registerValidation } from "./validations/auth.js"

import UserModel from "./models/User.js"
import checkAuth from "./utils/checkAuth.js"

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("DB ok"))
    .catch((err) => console.log("DB error", err))


const app = express()

app.use(express.json()) //without this will be undefined in req.body

app.get("/", (req, res) => {
    res.send("Hello World!")
})

app.post("/auth/login", async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email })

        if (!user) {
            return res.status(404).json({
                message: "Wrong email or password"
            })
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash)

        if (!isValidPass) {
            return res.status(404).json({
                message: "Wrong email or password"
            })
        }

        const token = jwt.sign({
            _id: user._id
        },
            process.env.JWT_SECRET,
            {
                expiresIn: "30d"
            }
        )

        // kind of destruction - take psswordHash but other values collect in userData
        const { passwordHash, ...userData } = user._doc

        res.json({ ...userData, token })

    } catch (err) {
        console.log("err=>", err)
        res.status(500).json({
            message: "authorization failed",
        })
    }
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
        const hash = await bcrypt.hash(password, salt)

        const doc = new UserModel({
            email,
            fullName,
            avatarUrl,
            passwordHash: hash
        })

        const user = await doc.save()

        const token = jwt.sign({
            _id: user._id
        },
            process.env.JWT_SECRET,
            {
                expiresIn: "30d"
            }
        )

        // kind of destruction - take psswordHash but other values collect in userData
        const { passwordHash, ...userData } = user._doc

        res.json({ ...userData, token })

    } catch (err) {
        console.log("err=>", err)
        res.status(500).json({
            message: "registration failed",
        })
    }
})

app.get("/auth/me", checkAuth, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)

        if (!user) {
            return res.status(404).json({
                message: "can't find user"
            })
        }

        const { passwordHash, ...userData } = user._doc

        res.json(userData)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "No access"
        })
    }
})

app.listen(4444, (err) => {
    if (err) {
        return console.log(err)
    }

    console.log("Server OK")
})