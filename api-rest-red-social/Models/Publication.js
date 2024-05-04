const { Schema, model } = require('mongoose');

const publicationSchema = new Schema({

    user: { type: Schema.ObjectId, ref: "User" },
    text: { type: String, required: true },
    file: { type: String, required: false },
    created_at: { type: Date, default: Date.now, required: false },

})

module.exports = model("publication", publicationSchema, "publications");