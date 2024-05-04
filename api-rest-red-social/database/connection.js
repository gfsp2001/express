const mongoose = require('mongoose');

const connection = async () => {
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect('mongodb://127.0.0.1:27017/mi_redsocial');
    } catch (error) {
        console.log(error);
        throw new Error('no se ha podido conectar a la base de datos');
    }
}

module.exports = connection
