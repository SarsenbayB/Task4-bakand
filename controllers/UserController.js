import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import UserModel from "../models/User.js"

export const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array());
        }

        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const doc = new UserModel({
            email: req.body.email,
            name: req.body.name,
            position: req.body.position,
            passwordHash: hash,
        });

        const user = await doc.save();

        const token = jwt.sign({
            _id: user._id,
        },
            "secret123",
            {
                expiresIn: "30d",
            },
        );

        const { passwordHash, ...userData } = user._doc;

        res.json({
            ...userData,
            token,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось зарегистрироваться",
        });
    }
};

export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                message: "Пользователь не найден",
            });
        }

        if (user.status === 'Blocked') {
            return res.status(403).json({
                message: "Ваш аккаунт заблокирован",
            });
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
        if (!isValidPass) {
            return res.status(400).json({
                message: "Неверный логин или пароль",
            });
        }

        // Обновляем поле lastLogin текущей датой
        user.lastLogin = new Date();
        await user.save();  // Сохраняем обновленные данные пользователя

        const token = jwt.sign({
            _id: user._id,
        },
            "secret123",
            {
                expiresIn: "30d",
            },
        );

        const { passwordHash, ...userData } = user._doc;

        res.json({
            ...userData,
            token,
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось авторизоваться",
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "Пользователь не найден",
            });
        }

        const { passwordHash, ...userData } = user._doc;

        res.json(userData);
    } catch (err) {
        res.status(500).json({
            message: "Нет доступа",
        });
    }
}

export const getAll = async (req, res) => {
    try {
        const users = await UserModel.find();

        if (!users || users.length === 0) { // Проверка на наличие пользователей
            return res.status(404).json({
                message: "Пользователи не найдены",
            });
        }

        res.json(users); // Возвращаем найденных пользователей
    } catch (err) {
        res.status(500).json({
            message: "Не удалось получить пользователей",
        });
    }
}

// Block Users
export const blockUsers = async (req, res) => {
    try {
        const userId = req.params.id;
        await UserModel.updateMany({ _id: userId }, { status: 'Blocked' });

        res.status(200).json({
            message: 'Пользователь блокирован',
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Неверные данные для блокирование пользователя',
        });
    }
};

// Unblock Users
export const unBlockUsers = async (req, res) => {
    try {
        const userId = req.params.id;
        await UserModel.updateMany({ _id: userId }, { status: 'Active' });

        res.status(200).json({
            message: 'Пользователь разблокирован',
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Неверные данные для разблокирование пользователя',
        });
    }
};

// Delete Users
export const remove = async (req, res) => {
    try {
        const userId = req.params.id;
        await UserModel.findOneAndDelete({ _id: userId });

        res.status(200).json({
            message: 'Пользователь удален',
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Неверные данные для удаления пользователя',
        });
    }
};