const express = require('express');
const router = express.Router();
var { almacenamiento_img } = require('../middlewares/subir_imagen');
const articuloController = require("../Controller/articuloController");
const img = almacenamiento_img();
//rutas de pruebas
router.get('/ruta_de_prueba', articuloController.prueba);
router.get('/curso', articuloController.curso);
router.post('/crear', articuloController.crear);
router.get('/listarArticulos/:ultimos?', articuloController.listarArticulos);
router.get('/listar_unico_articulo/:id', articuloController.listar_unico_articulo);
router.delete('/borrar_articulo/:id', articuloController.borrar_articulo);
router.put('/actualizar_articulo/:id', articuloController.actualizar_articulo);
router.post('/subir/:id', [img.single("file")], articuloController.subir);
router.get('/mostrar_imagen/:fichero', articuloController.mostrar_imagen);
router.get('/buscador/:busqueda', articuloController.buscador);

module.exports = router;
