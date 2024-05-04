const Album = require('../Models/Album');
const Song = require('../Models/Song');
const fs = require('fs');
const path = require('path');

const prueba = (req, res) => {

    res.status(200).send({ status: 'success', message: 'controlador album' });
};

const guardar_album = (req, res) => {

    let params = req.body;

    let album = new Album(params);

    album.save((err, album) => {

        if (err || !album) {
            res.status(500).send({ status: 'error', message: 'error al guardar el album.' });
        }

        res.status(200).send({ status: 'success', album });

    })
};

const mostrar_album = (req, res) => {

    const albumid = req.params.id;

    Album.findById(albumid).populate({ path: 'artist' }).exec((err, album) => {

        if (err || !album) {
            res.status(500).send({ status: 'error', message: 'error al mostrar el album.' });
        }

        res.status(200).send({ status: 'success', album });

    });
};

const list_albums = (req, res) => {

    const artistId = req.params.artistId;

    if (!artistId) {
        res.status(500).send({ status: 'error', message: 'error al mostrar la lista de albums.' });
    }

    Album.find({ artist: artistId }).populate('artist').exec((err, albums) => {

        if (err || !albums) {
            res.status(500).send({ status: 'error', message: 'error al mostrar el album.' });
        }

        res.status(200).send({ status: 'success', albums });

    })
};

const actualizar_albums = (req, res) => {

    const albumid = req.params.albumId;

    const params = req.body;

    Album.findByIdAndUpdate(albumid, params, { new: true }, (err, album) => {

        if (err || !album) {
            res.status(500).send({ status: 'error', message: 'error al actualizar el album.' });
        }

        res.status(200).send({ status: 'success', album });

    })

};

const eliminar_album = async (req, res) => {

    let id = req.params.id;

    try {

        const albumRemoved = await Album.findById(id).remove();
        const songRemoved = await Song.find({ album: id }).remove();

        res.status(200).send({ status: 'success', albumRemoved, songRemoved });

    } catch (error) {

        return res.status(500).send({ status: 'error', message: 'no se ha eliminado el album.' })

    }

};

const upload_imagen_album = async (req, res) => {

    let id = req.params.id;
    // recoger el fichero de imagen subido
    if (!req.file && !req.files) {
        return res.status(400).json({ status: "error", mensaje: "Petición invalida" });
    }
    // nombre del archivo 
    let archivo = req.file.originalname;
    // extension del archivo
    let archivo_split = archivo.split('\.');
    let extension = archivo_split[1];
    // comprobar extencion correta
    if (req.file.size >= 2000000) {

        fs.unlink(req.file.path, function (err) {
            if (err) throw err;
            return res.status(400).json({ status: "error", mensaje: "Imagen mayor a 2MB." });
        });

    } else {

        if (extension != "png" && extension != "jpg" && extension != "gif" && extension != "jpeg" && extension != "webp") {
            //borrar archivo y dar respuesta
            fs.unlinkSync(req.file.path, (error) => {
                return res.status(400).json({ status: "error", mensaje: "Formato de imagen invalida." });
            })

        }

        let AlbumPhoto = await Album.find({ _id: id });

        if (AlbumPhoto.length >= 1) {

            var img_delete = AlbumPhoto[0].image;

            if (img_delete != 'default.png') {
                var path_img_delete = './image/albums/' + img_delete;
                fs.unlink(path_img_delete, function (err) {
                    if (err) return res.status(500).json({ status: "error", mensaje: "Error al eliminar la foto." });
                });
            }
            try {
                //buscar y actualiza la imagen
                let actualizado = await Album.findOneAndUpdate({ _id: id }, { image: req.file.filename }, { new: true });
                // devolver respuesta
                return res.status(200).json({ status: 'success', image: actualizado });

            } catch (error) {
                return res.status(500).json({ status: 'success', mensaje: "Error al actualizar la foto." });

            }

        }

    }

};

const mostrar_imagen_album = (req, res) => {

    let fichero = req.params.file;
    let ruta_fisica = "./image/albums/" + fichero;

    fs.access(fichero, (existe) => {
        if (existe) {
            return res.sendFile(path.resolve(ruta_fisica));
        } else {
            return res.status(404).json({ status: "error", mensaje: "La imagen no existe." });
        }
    })

};


module.exports = {
    prueba,
    guardar_album,
    mostrar_album,
    list_albums,
    actualizar_albums,
    eliminar_album,
    upload_imagen_album,
    mostrar_imagen_album,
}