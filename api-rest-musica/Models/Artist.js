const { Schema, model } = require('mongoose');

const ArtistSchema = Schema({

    name: { type: String, required: true },
    description: { type: String, required: false },
    image: { type: String, default: 'default.png', required: false },
    created_at: { type: Date, default: Date.now }
});

module.exports = model("Artist", ArtistSchema, "Artists");