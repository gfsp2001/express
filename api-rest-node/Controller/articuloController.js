
const { validar_articulo } = require('../helpers/validar');
const Articulo = require('../modules/Articulo');
const fs = require('fs');
const path = require('path');


const prueba = (req, res) => {

    return res.status(200).json({ mensaje: "soy una accion de prueba en mi controlador de articulos" });
};

const curso = (req, res) => {

    console.log("Se ha ejecutado el endpoint probando");
    return res.status(200).json([{
        data: "esto es un dato",
        autor: "giancarlo santi"
    },
    {
        data: "esto es un dato",
        autor: "giancarlo santi"
    }]);
};

const crear = (req, res) => {

    //recoger los parametros por post a guardar
    let parametros = req.body;
    //validar datos
    try {
        validar_articulo(parametros);
    } catch (error) {
        return res.status(400).json({ mensaje: "error", status: "faltan datos por enviar." });
    }
    //crear el objeto a guardar
    const articulo = new Articulo(parametros);
    // asignar valores a objeto basado en el modelo (manual o automatico)
    // manera manual: articulo.titulo = parametros.titulo;

    //guardar el articulo en la base de datos 
    articulo.save((error, articuloGuardado) => {

        if (error || !articuloGuardado) {
            return res.status(400).json({ status: "error", mensaje: "No se ha guardado el articulo." });
        }
        // devolver resultado
        return res.status(200).json({ status: "success", mensaje: "Articulo creado con exito.", parametros: articuloGuardado });
    })
};

const listarArticulos = (req, res) => {

    let consulta = Articulo.find({});
    if (req.params.ultimos) {
        consulta.limit(req.params.ultimos);
    }
    consulta.sort({ fecha: -1 }).exec((error, articulos) => {
        if (error || !articulos) {
            return res.status(400).json({ status: "error", mensaje: "No se han encontrado ningun articulo." });
        }
        return res.status(200).json({ status: "success", parametro: req.params.ultimos, contador: articulos.length, articulos: articulos });
    });
};

const listar_unico_articulo = (req, res) => {
    // recoger un id por la url
    let id = req.params.id;
    // buscar articulo
    Articulo.findById(id, (err, articulo) => {

        // si no existe devolver error
        if (err || !articulo) {
            return res.status(400).json({ status: "error", mensaje: "No se han encontrado el articulo." });
        }
        // devolver resultado
        res.status(200).json({ status: "success", articulo });

    });

};

const borrar_articulo = (req, res) => {

    let id = req.params.id;

    Articulo.findOneAndDelete({ _id: id }, (err, articuloBorrado) => {

        if (err || !articuloBorrado) {
            return res.status(500).json({ status: "error", mensaje: "Error al borrar el articulo." });
        }

        return res.status(200).json({ status: "success", mensaje: "Articulo borrado.", articulo: articuloBorrado });

    });


};

const actualizar_articulo = (req, res) => {

    // recoger id articulo a editar
    let id = req.params.id;
    // recoger datos del body
    let parametros = req.body;
    //validar datos
    try {
        validar_articulo(parametros);
    } catch (error) {
        return res.status(400).json({ mensaje: "error", status: "faltan datos por enviar." });
    }
    //buscar y actualizar articulo
    Articulo.findOneAndUpdate({ _id: id }, parametros, { new: true }, (error, articuloActualizado) => {

        if (error || !articuloActualizado) {
            return res.status(500).json({ status: "error", mensaje: "Error al actualizar el articulo." });
        }

        // devolver respuesta
        return res.status(200).json({ status: 'success', articulo: articuloActualizado });
    });
};

const subir = (req, res) => {

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
            fs.unlink(req.file.path, (error) => {
                return res.status(400).json({ status: "error", mensaje: "Imagen invalida" });
            })

        } else {
            // si todo va bien, actualizar el articulo

            // recoger id articulo a editar
            let id = req.params.id;
            //buscar y actualizar articulo
            Articulo.findOneAndUpdate({ _id: id }, { imagen: req.file.filename }, { new: true }, (error, articuloActualizado) => {

                if (error || !articuloActualizado) {
                    return res.status(500).json({ status: "error", mensaje: "Error al actualizar el articulo." });
                }
                // devolver respuesta
                return res.status(200).json({ status: 'success', articulo: articuloActualizado, fichero: req.file });
            });

        }
    }

}

const mostrar_imagen = (req, res) => {

    let fichero = req.params.fichero;
    let ruta_fisica = "./imagenes/articulos/" + fichero;

    fs.access(fichero, (existe) => {
        if (existe) {
            return res.sendFile(path.resolve(ruta_fisica));
        } else {
            return res.status(404).json({ status: "error", mensaje: "La imagen no existe." });
        }
    })

};

const buscador = (req, res) => {
    //sacar el string de busqueda
    let busqueda = req.params.busqueda;
    // find OR 
    Articulo.find({
        "$or": [

            //$regex: expresion regular,  "$options": i, si lo incluye en alguna parte de nuestros campos
            { "titulo": { "$regex": busqueda, "$options": "i" } },
            { "contenido": { "$regex": busqueda, "$options": "i" } }
        ]
    })
        // Orden
        .sort({ fecha: -1 })
        // Ejecutar consulta
        .exec((err, articulosEncontrados) => {
            if (err || !articulosEncontrados || articulosEncontrados.length <= 0) {
                return res.status(404).json({ status: "error", mensaje: "No se encontro ningun articulo." });
            }
            // Devolver resultado
            return res.status(200).json({ status: "success", articulos: articulosEncontrados });
        });

}

module.exports = {
    prueba,
    curso,
    crear,
    listarArticulos,
    listar_unico_articulo,
    borrar_articulo,
    actualizar_articulo,
    subir,
    mostrar_imagen,
    buscador
}