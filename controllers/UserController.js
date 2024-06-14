import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import UserModel from "../models/User.js"


export const register = async (req, res) => {
    try {
        const { email, fullName, avatarUrl } = req.body
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
}

export const login = async (req, res) => {
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
}

export const getMe = async (req, res) => {
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
}