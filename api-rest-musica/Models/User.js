const { Schema, model } = require('mongoose');

const UserSchema = Schema({
    name: { type: String, required: true },
    surname: { type: String, required: false },
    nick: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true, select: false },
    role: { type: String, default: "role_user", required: false, select: false },
    image: { type: String, default: "default.png", required: false },
    created_at: { type: Date, default: Date.now }
})

module.exports = model("User", UserSchema, "Users");
