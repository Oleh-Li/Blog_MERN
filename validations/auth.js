import { body } from "express-validator"

export const registerValidation = [
    body("email", "Wrong email").isEmail(),
    body("password", "Wrong password").isLength({ min: 5 }),
    body("fullName", "Wrong full name").isLength({ min: 3 }),
    body("avatarUrl").optional().isURL()
]