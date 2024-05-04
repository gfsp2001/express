const multer = require('multer');

exports.almacenamiento_img = (carpeta) => {

    let sub = carpeta.substr(0, 3);

    const almacenamiento = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './image/' + carpeta + '/')
        },
        filename: (req, file, cb) => {
            cb(null, sub + '-' + Date.now() + file.originalname)
        }
    })

    return subidas = multer({ storage: almacenamiento });

}





