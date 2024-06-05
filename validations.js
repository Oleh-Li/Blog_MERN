import { body } from "express-validator"

export const loginValidation = [
    body("email", "Wrong email").isEmail(),
    body("password", "Wrong password").isLength({ min: 5 }),
]

export const registerValidation = [
    body("email", "Wrong email").isEmail(),
    body("password", "Wrong password").isLength({ min: 5 }),
    body("fullName", "Wrong full name").isLength({ min: 3 }),
    body("avatarUrl").optional().isURL()
]

export const postCreateValidation = [
    body("title", "Wrong title").isLength({ min: 5 }).isString(),
    body("text", "Wrong text").isLength({ min: 10 }).isString(),
    body("tags", "Wrong tags (await for array)").optional().isString(),
    body("imageUrl", "Wrong image URL").optional().isString()
]