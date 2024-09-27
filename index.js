import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { registerValidation, loginValidation } from "./validations.js";
import checkAuth from "./utils/checkAuth.js";
import * as UserController from "./controllers/UserController.js";

// Загружаем переменные окружения
dotenv.config();

// Constants
const PORT = process.env.PORT || 4445;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

mongoose
    .connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.ha6g4.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => console.log("DB ok"))
    .catch((err) => console.log("DB error", err));

const app = express();

app.use(express.json());
app.use(cors());

app.post("/auth/login", loginValidation, UserController.login);
app.post("/auth/register", registerValidation, UserController.register);
app.get("/auth/me", checkAuth, UserController.getMe);
app.get("/users", checkAuth, UserController.getAll);

app.put("/users/block/:id", checkAuth, UserController.blockUsers);
app.put("/users/unBlock/:id", checkAuth, UserController.unBlockUsers);
app.delete("/users/:id", checkAuth, UserController.remove);

app.listen(PORT, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log("Server OK");
});