const express = require('express');
const router = express.Router();
const songController = require('../Controllers/songController');
const { almacenamiento_img } = require('../middlewares/multer');
const auth = require('../Middlewares/auth');
const img = almacenamiento_img('songs');

router.get('/prueba', songController.prueba);
router.post('/guardar_song', auth.auth, songController.guardar_song);
router.get('/listar_song/:id', auth.auth, songController.listar_song);
router.get('/listar_song_album/:albumid', auth.auth, songController.listar_song_album);
router.put('/actualizar_song/:id', auth.auth, songController.actualizar_song);
router.put('/eliminar_song/:id', auth.auth, songController.eliminar_song);

router.post('/upload_song/:id', [auth.auth, img.single("file")], songController.upload_song);
router.get('/mostrar_song/:file', songController.mostrar_song);

module.exports = router;