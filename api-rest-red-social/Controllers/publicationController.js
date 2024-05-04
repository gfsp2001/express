//importar modelo
const Publication = require('../Models/Publication');
const followService = require('../helpers/FollowService');
const fs = require('fs');
const path = require('path');

//Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({ message: "mensaje enviado desde el controlador" })
}
//guardar publicacion
const guardar_publicacion = (req, res) => {
    //recoger datos del body
    const params = req.body;
    // si no me llegan dar respuesta negativa
    if (!params.text) return res.status(404).send({ status: "error", message: "falta texto." });
    // crear y rellenar el objeto del modelo 
    let newPublication = new Publication(params);
    newPublication.user = req.user.id;
    // guardar objeto en bbdd
    newPublication.save((err, publicacionCreated) => {

        if (err || !publicacionCreated) return res.status({ status: "error", message: "no se guardo la publicaciion" });

        //devolver respuesta
        return res.status(200).send({ status: "success", publicacionCreated });
    });
}
//sacar una publicacion
const detalle_publicacion = (req, res) => {
    // sacar id de publicacion de la url
    let id = req.params.id;
    // find con la condicion del id 
    Publication.findById(id)
        .select({ '__v': 0 })
        .then((publicacion) => {
            // devolver respuesta
            return res.status(200).send({ status: "success", publicacion });

        }).catch((err) => {
            // devolver respuesta
            return res.status(500).send({ status: "error", message: "error al visualizar la publicacion" });
        });
}
//eliminar publicaciones 
const eliminar_publicacion = (req, res) => {


    let idPublication = req.params.id;

    Publication.find({ "user": req.user.id, "_id": idPublication })
        .remove(error => {
            if (error) return res.status(500).send({ status: "error", message: "error al eliminar publicacion" });
        })

    return res.status(200).send({ status: "success", message: "publicacion eliminada", Publication: idPublication });
}
//listar todas las publicaciones de un usuario
const publicaciones_user = (req, res) => {
    // sacar el id de usuario
    let userId = req.params.id;
    // controlar la pagina 
    let page = 1;
    if (req.params.page) page = req.params.page;

    const itemsPerPage = 5;
    //find, populate, ordenar, paginar
    Publication.find({ "user": userId })
        .sort({ "_id": -1 })
        .populate("user", "-password -role -__v -email")
        .paginate(page, itemsPerPage, (err, publications, total) => {

            if (err || !publications || publications.length <= 0) return res.status(404).send({ status: "error", message: "no hay publicaciones" });

            // devolver un resultado
            return res.status(200).send({ status: "success", message: "listado", user: req.user, publications, page, total, pages: Math.ceil(total / itemsPerPage) });

        })

}
//subir ficheros
const upload_image_publicacion = (req, res) => {

    let id = req.user.id;
    const publicationId = req.params.id;
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
        return res.status(400).json({ status: "error", mensaje: "Imagen mayor a 2MB." });
    } else {

        if (extension != "png" && extension != "jpg" && extension != "gif" && extension != "jpeg" && extension != "webp") {
            //borrar archivo y dar respuesta
            fs.unlinkSync(req.file.path, (error) => {
                return res.status(400).json({ status: "error", mensaje: "Imagen invalida" });
            })

        }

        //buscar y actualizar articulo
        Publication.findOneAndUpdate({ user: id, "_id": publicationId }, { file: req.file.filename }, { new: true }, (error, pubUpdated) => {

            if (error || !pubUpdated) {
                return res.status(500).json({ status: "error", mensaje: "Error al actualizar el articulo." });
            }
            // devolver respuesta
            return res.status(200).json({ status: 'success', publication: pubUpdated, file: req.file, user: req.user });
        });

    }

}
// devolver archivos multimedia imagenes
const mostrar_media_publicacion = (req, res) => {

    let fichero = req.params.file;
    let ruta_fisica = "./image/publications/" + fichero;

    fs.access(fichero, (existe) => {
        if (existe) {
            return res.sendFile(path.resolve(ruta_fisica));
        } else {
            return res.status(404).json({ status: "error", mensaje: "La imagen no existe." });
        }
    })

}
//listar todas las publicaciones (FEED)
const feed_publicacion = async (req, res) => {
    // sacar la pagina actual
    let page = 1;
    if (req.params.page) page = req.params.page;

    const itemsPerPage = 5;

    //sacar un array de identificadores de usuarios que yo sigo como usuario logueado
    try {
        const myFollows = await followService.followUserIds(req.user.id);
        //find a publicaciones 
        const publication = Publication.find({ user: myFollows.following })
            .populate("user", "-password -role -__v -email").sort("-_id")
            .paginate(page, itemsPerPage, (error, publications, total) => {

                if (error || !publications || publications.length <= 0) return res.status(404).send({ status: "error", message: "no hay publicaciones" });

                return res.status(200).json({
                    status: "success",
                    mensaje: "feed",
                    following: myFollows.following,
                    publications,
                    page,
                    total,
                    pages: Math.ceil(total / itemsPerPage)
                });

            });


    } catch (error) {
        return res.status(404).json({ status: "error", mensaje: "no se han listado las publicaciones del feed" });
    }


}

module.exports = {
    pruebaPublication,
    guardar_publicacion,
    detalle_publicacion,
    eliminar_publicacion,
    publicaciones_user,
    upload_image_publicacion,
    mostrar_media_publicacion,
    feed_publicacion

}