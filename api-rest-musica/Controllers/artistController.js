const validate = require('../Helpers/validate');
const Artist = require('../Models/Artist');
const Album = require('../Models/Album');
const Song = require('../Models/Song');
const bcrypt = require('bcrypt');
const jwt = require('../Helpers/jwt');
const fs = require('fs');
const path = require('path');
const pagination = require('mongoose-pagination');

const prueba = (req, res) => {

    res.status(200).send({ status: 'success', message: 'controlador artist' });
};

const guardar_artist = (req, res) => {

    let params = req.body;

    let artist = new Artist(params);

    artist.save((err, artistSaved) => {

        if (err || !artistSaved) return res.status(404).send({ status: 'error', message: 'error saving' })

        res.status(200).send({ status: 'success', artistSaved });
    });
}

const perfil_Artist = (req, res) => {

    let artistId = req.params.id;

    Artist.findById(artistId, (err, artist) => {

        if (err || !artist) return res.status(404).send({ status: 'error', message: 'error saving' })

        res.status(200).send({ status: 'success', artist });
    })

}

const list_artists = (req, res) => {

    let page = 1;
    let itemPerPage = 5;
    if (req.params.page) {
        page = req.params.page;
    }

    Artist.find()
        .sort('name')
        .paginate(page, itemPerPage, (err, artists, total) => {

            if (err || !artists) return res.status(404).send({ status: 'error', message: 'no hay artists' })

            res.status(200).send({ status: 'success', artists, page, total, pages: Math.ceil(total / itemPerPage) });

        })

}

const update_Artist = (req, res) => {

    let id = req.params.id;
    const data = req.body;

    Artist.findByIdAndUpdate(id, data, { new: true }, (err, artistUpdated) => {

        if (err || !artistUpdated) return res.status(500).send({ status: 'error', message: 'no se actualizo el artista.' })

        res.status(200).send({ status: 'success', artistUpdated });

    });

}

const eliminar_artist = async (req, res) => {

    let id = req.params.id;

    try {
        const artistRemoved = await Artist.findByIdAndDelete(id);
        const albumRemoved = await Album.find({ artist: id });

        albumRemoved.forEach(async (album) => {
            album.remove();

            const songRemoved = await Song.find({ album: album._id }).remove();

            album.remove();
        });

        res.status(200).send({ status: 'success', artistRemoved });

    } catch (error) {

        return res.status(500).send({ status: 'error', message: 'no se ha eliminado el artista.' })

    }

}

const upload_image_artist = async (req, res) => {

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

        let ArtistPhoto = await Artist.find({ _id: id });

        if (ArtistPhoto.length >= 1) {

            var img_delete = ArtistPhoto[0].image;

            if (img_delete != 'default.png') {
                var path_img_delete = './image/artists/' + img_delete;
                fs.unlink(path_img_delete, function (err) {
                    if (err) return res.status(500).json({ status: "error", mensaje: "Error al eliminar la foto." });
                });
            }
            try {
                //buscar y actualiza la imagen
                let actualizado = await Artist.findOneAndUpdate({ _id: id }, { image: req.file.filename }, { new: true });
                // devolver respuesta
                return res.status(200).json({ status: 'success', image: actualizado });

            } catch (error) {
                return res.status(500).json({ status: 'success', mensaje: "Error al actualizar la foto." });

            }

        }

    }

}

const mostrar_imagen_artist = (req, res) => {

    let fichero = req.params.file;
    let ruta_fisica = "./image/artists/" + fichero;

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
    guardar_artist,
    perfil_Artist,
    list_artists,
    update_Artist,
    eliminar_artist,
    upload_image_artist,
    mostrar_imagen_artist
}
