const validate = require('../Helpers/validate');
const user = require('../Models/User');
const bcrypt = require('bcrypt');
const jwt = require('../Helpers/jwt');
const fs = require('fs');
const path = require('path');

const prueba = (req, res) => {

    res.status(200).send({ status: 'success', message: 'controlador user' });
};

const registrar_user = (req, res) => {

    let params = req.body;


    if (!params.name || !params.nick || !params.email || !params.password) {
        res.status(500).send({ status: 'error', message: 'Invalid' });
    }
    try {
        validate(params);

        user.find({
            $or: [
                { email: params.email.toLowerCase() },
                { nick: params.nick.toLowerCase() }
            ]
        }).exec(async (err, results) => {

            if (err || results && results.length >= 1) {
                res.status(500).send({ status: 'error', message: 'Usuario ya existe o existe un error.', error: err });
            }

            let pwd = await bcrypt.hash(params.password, 10);
            params.password = pwd;

            let userToSave = new user(params);

            userToSave.save((error, userStored) => {

                if (error) {
                    res.status(500).send({ status: 'error', message: 'error al registrar usuario.', error: err });
                }

                let usuarioCreated = userStored.toObject();
                delete usuarioCreated.password;
                delete usuarioCreated.role;
                res.status(200).send({ status: 'success', message: 'registrado exitosamente.', usuarioCreated });
            })

        })
    } catch (error) {
        res.status(500).send({ status: 'error', message: 'validación no superada' });
    }

};

const login_user = (req, res) => {

    let params = req.body;

    if (!params.email || !params.password) {
        return res.status(404).send({ status: 'error', message: 'datos invalidos' });
    }

    user.findOne({ email: params.email })
        .select("+password")
        .exec((err, user) => {

            if (err || !user) return res.status(404).send({ status: 'error', message: 'no existe el usuario' });

            const pwd = bcrypt.compareSync(params.password, user.password);

            if (!pwd) return res.status(404).send({ status: 'error', message: 'login incorrecto' });

            //limpiar objetos
            let identity = user.toObject();
            delete identity.password;

            const token = jwt.createToken(user);

            res.status(200).send({ status: 'success', message: 'login exitoso.', identity, token: token });

        })
}

const profile_user = (req, res) => {

    const id = req.params.id;

    user.findById(id, (err, user) => {

        if (err || !user) res.status(404).send({ status: 'error', message: 'usuario no existe' });

        res.status(200).send({ status: 'success', message: 'perfil.', user });

    })

}

const update_user = (req, res) => {

    let userIdentity = req.user;
    let userToUpdate = req.body;

    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.image;

    try {

        validate(userToUpdate);

        user.find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { nick: userToUpdate.nick.toLowerCase() }
            ]
        }).exec(async (err, users) => {

            if (err || !users) res.status(500).send({ status: 'error', message: 'no se pudo actualizar el usuario.' });

            let userIsset = false;

            // comprobar si el usuario existe y no soy yo (el identificado)
            users.forEach(user => {
                if (user && user._id != userIdentity.id) userIsset = true;
            })

            // si ya existe devuelvo una respuesta
            if (userIsset) {
                res.status(400).send({ status: 'sucess', message: 'el usuario ya existe.' });
            } else {

                if (userToUpdate.password) {
                    let pwd = bcrypt.hashSync(userToUpdate.password, 10);
                    userToUpdate.password = pwd;
                } else {
                    delete userToUpdate.password;
                }

                try {
                    let userUpdated = await user.findByIdAndUpdate({ _id: userIdentity.id }, userToUpdate, { new: true });

                    if (!userUpdated) {
                        res.status(400).send({ status: 'error', message: 'usuario no actualizado.' });
                    } else {
                        res.status(200).send({ status: 'success', message: 'actualizar.', userUpdated });
                    }

                } catch (error) {
                    res.status(400).send({ status: 'error', message: 'error el actualizar el usuario.' });
                }

            }
        })

    } catch (error) {
        res.status(500).send({ status: 'error', message: 'validación no superada' });
    }
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
                return res.status(400).json({ status: "error", mensaje: "Formato de imagen invalida." });
            })

        }

        let userPhoto = await user.find({ _id: id });

        if (userPhoto.length >= 1) {

            var img_delete = userPhoto[0].image;

            if (img_delete != 'default.png') {
                var path_img_delete = './image/avatars/' + img_delete;
                fs.unlink(path_img_delete, function (err) {
                    if (err) return res.status(500).json({ status: "error", mensaje: "Error al eliminar la foto." });
                });
            }
            try {
                //buscar y actualiza la imagen
                let actualizado = await user.findOneAndUpdate({ _id: id }, { image: req.file.filename }, { new: true });
                // devolver respuesta
                return res.status(200).json({ status: 'success', image: actualizado });

            } catch (error) {
                return res.status(500).json({ status: 'success', mensaje: "Error al actualizar la foto." });

            }

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


module.exports = {
    prueba,
    registrar_user,
    login_user,
    profile_user,
    update_user,
    upload_image_user,
    mostrar_imagen_user
}