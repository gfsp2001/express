const express = require('express');
const router = express.Router();
const albumController = require('../Controllers/albumController');
const { almacenamiento_img } = require('../middlewares/multer');
const auth = require('../Middlewares/auth');
const img = almacenamiento_img('albums');

router.get('/prueba', albumController.prueba);
router.post('/guardar_album', auth.auth, albumController.guardar_album);
router.get('/mostrar_album/:id', auth.auth, albumController.mostrar_album);
router.get('/list_albums/:artistId', auth.auth, albumController.list_albums);
router.put('/actualizar_albums/:albumId', auth.auth, albumController.actualizar_albums);
router.delete('/eliminar_album/:id', auth.auth, albumController.eliminar_album);
router.post('/upload_imagen_album/:id', [auth.auth, img.single("file")], albumController.upload_imagen_album);
router.get('/mostrar_imagen_album/:file', albumController.mostrar_imagen_album);


module.exports = router;