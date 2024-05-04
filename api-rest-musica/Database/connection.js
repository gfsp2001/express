const mongoose = require('mongoose');

const connection = async () => {
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect('mongodb://127.0.0.1:27017/app_musica');
    } catch (error) {
        console.log(error);
        throw new Error('Cannot connect to database');
    }
}
module.exports = connection
