const { Schema, model } = require('mongoose');

const AlbumSchema = Schema({

    artist: { type: Schema.ObjectId, ref: 'Artist', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    year: { type: Number, required: false },
    image: { type: String, default: 'default.png', required: false },
    created_at: { type: Date, default: Date.now }

});

module.exports = model('Album', AlbumSchema, 'Albums');