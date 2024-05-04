const express = require('express');
const router = express.Router();
const artistController = require('../Controllers/artistController');
const { almacenamiento_img } = require('../middlewares/multer');
const auth = require('../Middlewares/auth');
const img = almacenamiento_img('artists');

router.get('/prueba', artistController.prueba);
router.post('/guardar_artist', auth.auth, artistController.guardar_artist);
router.get('/perfil_Artist/:id', auth.auth, artistController.perfil_Artist);
router.get('/list_artists/:page?', auth.auth, artistController.list_artists);
router.put('/update_Artist/:id', auth.auth, artistController.update_Artist);
router.delete('/eliminar_artist/:id', auth.auth, artistController.eliminar_artist);
router.post('/upload_image_artist/:id', [auth.auth, img.single("file")], artistController.upload_image_artist);
router.get('/mostrar_imagen_artist/:file', artistController.mostrar_imagen_artist);

module.exports = router;