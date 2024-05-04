//importar dependencias y modulos
const User = require('../Models/User');
const Publication = require('../Models/Publication');
const bcrypt = require('bcrypt');
const jwt = require('../helpers/jwt');
const mogoosePaginate = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');
const followService = require('../helpers/FollowService');
const Follow = require('../Models/Follow');
const validate = require('../helpers/validator');
//Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({ message: "mensaje enviado desde el controlador", user: req.user })
}

// registro de usuarios
const registrar_user = (req, res) => {

    //Recoger datos de la peticion
    let params = req.body;
    //comprobar que me llegan bien (+validacion)
    if (!params.name || !params.email || !params.password || !params.nick) {

        res.status(400).json({ status: "error", message: "faltan datos por enviar" });

    }

    //validacion avanzada
    try {
        validate.validate(params)
    } catch (error) {
        res.status(400).json({ status: "error", message: "validacion no superada" });
    }


    //control usuarios duplicados
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() },
        ]
    }).exec(async (error, users) => {
        if (error) {
            return res.status(500).json({ status: 'error', message: "error en la consulta" });
        }
        if (users && users.length >= 1) {
            return res.status(200).send({ status: 'success', message: 'el usuario ya existe' });
        }
        //cifrar la contraseña 
        let hash = await bcrypt.hash(params.password, 10);
        params.password = hash;
        //crear objeto de usuario
        const user = new User(params);
        //guardar usuario en la base de datos
        user.save((err, userStored) => {

            if (err || !userStored) {
                return res.status(500).json({ status: 'error', message: "error al crear el usuario" });
            }
            //devolver el resultado
            return res.status(200).json({ status: "success", message: "usuario registrado correctamente", userStored });
        });

    })

}

const login_user = (req, res) => {

    // recoger los parametros 
    let params = req.body;

    if (!params.email || !params.password) {
        return res.status(400).json({ status: 'error', message: "faltan datos por enviar" });
    }
    // buscar en la base de datos si existe 
    User.findOne({ email: params.email })
        //.select({ "created_at": 0, "role": 0 })
        .exec((error, user) => {

            if (error || !user) {
                return res.status(404).json({ status: 'error', message: "no existe el usuario" });
            }
            // comprobar su contraseña 
            const pwd = bcrypt.compareSync(params.password, user.password)

            if (!pwd) {
                return res.status(404).json({ status: 'error', message: "no te has indentificado correctamente" });
            }
            //conseguir token
            const token = jwt.createToken(user);
            // devolver datos del usuario
            return res.status(200).json({ status: "success", message: "te has indentificado correctamente", user: { id: user._id, name: user.name, nick: user.nick }, token });

        })

}

const profile_user = (req, res) => {

    //recibir el parametro del id de usuario por la url
    let id = req.params.id;

    //consulta para sacar los datos del usuario
    User.findById(id)
        .select({ password: 0, role: 0 })
        .exec(async (error, user) => {
            if (error || !user) {
                return res.status(404).send({ status: 'error', message: 'el usuario no existe' })
            }
            //info de seguimiento
            const followInfo = await followService.followThisUser(req.user.id, id)

            //posteriormente: devolver informacio nde follows
            return res.status(200).send({ status: 'success', user: user, following: followInfo.following, follower: followInfo.follower });
        })

}

const list_users = (req, res) => {

    //controlar en q pagina estamos 
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    page = parseInt(page);
    // consulta con mogoose paginate
    let itemsPerPage = 5;

    User.find().select("-password -email -role -__v").sort('_id').paginate(page, itemsPerPage, async (error, users, total) => {

        if (error || !users) {
            return res.status(404).send({ status: 'error', message: 'no hay usuarios disponibles' })
        }

        //sacar un array de ids de los usuarios que me siguen y los que sigo como giancarlo
        let followUserIds = await followService.followUserIds(req.user.id);
        // devolver resultado (posteriormente info de follow)
        return res.status(200).send({
            status: 'success',
            message: 'ruta de listado de usuarios',
            users,
            page,
            itemsPerPage,
            total,
            pages: Math.ceil(total / itemsPerPage),
            following: followUserIds.following,
            followers: followUserIds.followers
        })
    })

}

const actualizar_user = (req, res) => {
    //recoger info del usuario a actualizar
    const userIdentity = req.user;
    let userToUpdate = req.body;
    // eliminar campos sobrantes
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;
    // comprobar si el usuario ya existe
    //control usuarios duplicados
    User.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nick: userToUpdate.nick.toLowerCase() },
        ]
    }).exec(async (error, users) => {
        if (error) {
            return res.status(500).json({ status: 'error', message: "error en la consulta" });
        }
        let userIsset = false;
        users.forEach(user => {
            if (user && user._id != userIdentity.id) {
                userIsset = true;
            }
        });
        if (userIsset) {
            return res.status(200).send({ status: 'success', message: 'el usuario ya existe' });
        } else {

            //cifrar la contraseña 
            if (userToUpdate.password) {
                let hash = await bcrypt.hash(userToUpdate.password, 10);
                userToUpdate.password = hash;
            } else {
                delete userToUpdate.password;
            }

            // buscar y actualizar
            try {
                let userUpdated = await User.findByIdAndUpdate({ _id: userIdentity.id }, userToUpdate, { new: true });

                if (!userUpdated) {
                    return res.status(500).send({ status: 'error', message: 'no se ha podido actualizar el usuario' })
                }
                //devolver respuesta
                res.status(200).send({ status: 'success', user: userUpdated });

            } catch (error) {
                return res.status(500).send({ status: 'error', message: 'error al actualizar' })
            }

        }


    })

}

const upload_image_user = async (req, res) => {

    let id = req.user.id;
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
                return res.status(400).json({ status: "error", mensaje: "Imagen invalida" });
            })

        }

        try {

            let userPhoto = await User.find({ _id: id });


            if (userPhoto.length >= 1) {

                var img_delete = userPhoto[0].image;

                if (img_delete != 'default.png') {

                    var path_img_delete = './image/avatars/' + img_delete;
                    fs.unlink(path_img_delete, function (err) {
                        if (err) return res.status(500).json({ status: "error", mensaje: "Error al eliminar la foto." });
                    });

                }

                //buscar y actualizar articulo
                User.findOneAndUpdate({ _id: id }, { image: req.file.filename }, { new: true }, (error, imgUpdated) => {

                    if (error || !imgUpdated) {
                        return res.status(500).json({ status: "error", mensaje: "Error al actualizar el la foto del usuario." });
                    }
                    // devolver respuesta
                    return res.status(200).json({ status: 'success', image: imgUpdated, fichero: req.file });
                });

            }

        } catch (error) {
            return res.status(404).json({ status: 'error', message: 'error en la petición.' });
        }


    }

}

const mostrar_imagen_user = (req, res) => {

    let fichero = req.params.file;
    let ruta_fisica = "./image/avatars/" + fichero;

    fs.access(fichero, (existe) => {
        if (existe) {
            return res.sendFile(path.resolve(ruta_fisica));
        } else {
            return res.status(404).json({ status: "error", mensaje: "La imagen no existe." });
        }
    })

};

const contador_user = async (req, res) => {

    let userId = req.user.id;

    if (req.user.id) userId = req.params.id;

    try {
        const following = await Follow.count({ "user": userId })
        const followed = await Follow.count({ "user": userId })
        const publications = await Publication.count({ "user": userId })

        return res.status(200).send({ userId, following: following, followed: followed, publications: publications })
    } catch (error) {
        return res.status(500).send({ error: "error", message: "error en la consulta de contador" })
    }

}

module.exports = {
    pruebaUser,
    registrar_user,
    login_user,
    profile_user,
    list_users,
    actualizar_user,
    upload_image_user,
    mostrar_imagen_user,
    contador_user
}