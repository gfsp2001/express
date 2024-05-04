const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    name: { type: String, required: true },
    surname: { type: String, required: false },
    bio: { type: String, required: false },
    nick: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "role_user", require: false },
    image: { type: String, default: "default.png", required: false },
    created_at: { type: Date, default: Date.now }
})

module.exports = model("User", userSchema, "users");
                    //coleccion: users
                    // si tu especificas la coleccion mongo crea una coleccion nueva pluralizando el valor que le asignaste