import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    lastLogin: { type: Date },
    status: { type: String, default: "Active" },
}, { timestamps: true });

export default mongoose.model("User", UserSchema);