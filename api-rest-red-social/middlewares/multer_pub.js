const multer = require('multer');

exports.almacenamiento_img = () => {

    const almacenamiento = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './image/publications/')
        },
        filename: (req, file, cb) => {
            cb(null, 'pub-' + Date.now() + file.originalname)
        }
    })

    return subidas = multer({ storage: almacenamiento });

}





