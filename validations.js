import { body } from "express-validator";


export const loginValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен быть минимум 1 символов').isLength({ min: 1 }),
];

export const registerValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен быть минимум 1 символов').isLength({ min: 1 }),
    body('name', 'Укажите имя').isLength({ min: 3 }),
    body('position', 'Укажите позицию').isLength({ min: 2 }),
];