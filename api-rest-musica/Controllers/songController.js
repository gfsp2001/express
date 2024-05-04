const Song = require('../Models/Song');
const fs = require('fs');
const path = require('path');

const prueba = (req, res) => {

    res.status(200).send({ status: 'success', message: 'controlador song' });
};

const guardar_song = (req, res) => {

    let params = req.body;

    let song = new Song(params);

    song.save((err, songStored) => {

        if (err || !songStored) {
            res.status(500).send({ status: 'error', message: 'error al guardar la musica.' });
        }

        res.status(200).send({ status: 'success', song: songStored });

    })

};

const listar_song = (req, res) => {

    let songId = req.params.id;

    Song.findById(songId).populate('album').exec((err, song) => {


        if (err || !song) {
            res.status(500).send({ status: 'error', message: 'error al mostrar la musica.' });
        }

        res.status(200).send({ status: 'success', song: song });

    })
};

const listar_song_album = (req, res) => {

    let idAlbum = req.params.albumid;

    Song.find({ album: idAlbum })
        .populate({ path: 'album', populate: { path: 'artist', model: 'artist' } })
        .sort('track')
        .exec((err, song) => {

            if (err || !song) {
                res.status(500).send({ status: 'error', message: 'error.' });
            }

            res.status(200).send({ status: 'success', song: song });

        })

};

const actualizar_song = (req, res) => {

    let songId = req.params.id;

    let data = req.body;

    Song.findByIdAndUpdate(songId, data, { new: true }, (err, song) => {

        if (err || !song) {
            res.status(500).send({ status: 'error', message: 'error.' });
        }

        res.status(200).send({ status: 'success', song: song });

    })

};

const eliminar_song = (req, res) => {

    const songid = req.params.id;

    Song.findByIdAndRemove(songid, (err, song) => {

        if (err || !song) {
            res.status(500).send({ status: 'error', message: 'error to remove.' });
        }

        res.status(200).send({ status: 'success', song: song });

    });

};

const upload_song = async (req, res) => {

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


    if (extension != "mp3" && extension != "ogg") {
        //borrar archivo y dar respuesta
        fs.unlinkSync(req.file.path, (error) => {
            return res.status(400).json({ status: "error", mensaje: "Formato de musica invalida." });
        })

    } else {

        let songMusic = await Song.find({ _id: id });

        if (songMusic.length >= 1) {

            var img_delete = songMusic[0].file;

            if (img_delete) {
                var path_img_delete = './image/songs/' + img_delete;
                fs.unlink(path_img_delete, function (err) {
                    if (err) return res.status(500).json({ status: "error", mensaje: "Error al eliminar la musica." });
                });
            }
            try {
                //buscar y actualiza la imagen
                let actualizado = await Song.findOneAndUpdate({ _id: id }, { file: req.file.filename }, { new: true });
                // devolver respuesta
                return res.status(200).json({ status: 'success', song: actualizado });

            } catch (error) {
                return res.status(500).json({ status: 'success', mensaje: "Error al actualizar la musica." });

            }

        }

    }

};

const mostrar_song = (req, res) => {

    let fichero = req.params.file;
    let ruta_fisica = "./image/songs/" + fichero;

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
    guardar_song,
    listar_song,
    listar_song_album,
    actualizar_song,
    eliminar_song,
    upload_song,
    mostrar_song
}