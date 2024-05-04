const { Schema, model } = require('mongoose');

const SongSchema = Schema({
    album: { type: Schema.ObjectId, ref: 'Album' },
    track: { type: Number, required: true },
    name: { type: String, required: true },
    duration: { type: String, required: true },
    file: { type: String, required: false },
    created_at: { type: Date, defualt: Date.now }
});

module.exports = model("Song", SongSchema, "Songs");