import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import multer from "multer"

import { loginValidation, postCreateValidation, registerValidation } from "./validations.js"

import checkAuth from "./utils/checkAuth.js"

import * as UserController from "./controllers/UserController.js"
import * as PostController from "./controllers/PostController.js"

dotenv.config()

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("DB ok"))
    .catch((err) => console.log("DB error", err))


const app = express()

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads')
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })

app.use(express.json()) //without this will be undefined in req.body
app.use('/uploads', express.static('uploads'))

app.get("/", (req, res) => {
    res.send("Hello World!")
})

app.post("/auth/login", loginValidation, UserController.login)
app.post("/auth/register", registerValidation, UserController.register)
app.get("/auth/me", checkAuth, UserController.getMe)

app.post("/upload", checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`
    })
})

app.get("/posts", PostController.getAll)
app.get("/posts/:id", PostController.getOne)
app.post("/posts", checkAuth, postCreateValidation, PostController.create)
app.delete("/posts/:id", checkAuth, PostController.remove)
app.patch("/posts/:id", checkAuth, postCreateValidation, PostController.update)

app.listen(4444, (err) => {
    if (err) {
        return console.log(err)
    }

    console.log("Server OK")
})