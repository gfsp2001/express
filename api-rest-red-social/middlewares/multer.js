const multer = require('multer');

exports.almacenamiento_img = () => {

    const almacenamiento = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './image/avatars/')
        },
        filename: (req, file, cb) => {
            cb(null, 'articulo' + Date.now() + file.originalname)
        }
    })

    return subidas = multer({ storage: almacenamiento });

}





