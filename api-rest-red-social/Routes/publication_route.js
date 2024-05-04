const express = require('express');
const router = express.Router();
const publicationController = require('../Controllers/publicationController');
const auth = require('../middlewares/auth');
const { almacenamiento_img } = require('../middlewares/multer_pub');
// configurarcion de subida
const img = almacenamiento_img();

// definir rutas
router.get('/pruebaPublication', auth.auth, publicationController.pruebaPublication)
router.post('/guardar_publicacion', auth.auth, publicationController.guardar_publicacion);
router.get('/detalle_publicacion/:id', auth.auth, publicationController.detalle_publicacion);
router.delete('/eliminar_publicacion/:id', auth.auth, publicationController.eliminar_publicacion);
router.get('/publicaciones_user/:id/:page?', auth.auth, publicationController.publicaciones_user)
router.post('/upload_image_publicacion/:id', [auth.auth, img.single("file")], publicationController.upload_image_publicacion);
router.get('/mostrar_media_publicacion/:file', publicationController.mostrar_media_publicacion);
router.get('/feed_publicacion/:page?', auth.auth, publicationController.feed_publicacion);

// exportar router
module.exports = router;