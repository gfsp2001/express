const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const auth = require('../middlewares/auth');
const { almacenamiento_img } = require('../middlewares/multer');
// configurarcion de subida
const img = almacenamiento_img();
// definir rutas
router.get('/pruebaUser', auth.auth, userController.pruebaUser);
router.post('/registrar_user', userController.registrar_user);
router.post('/login_user', userController.login_user);
router.get('/profile_user/:id', auth.auth, userController.profile_user);
router.get('/list_users/:page?', auth.auth, userController.list_users);
router.put('/actualizar_user', auth.auth, userController.actualizar_user);
router.post('/upload_image_user', [auth.auth, img.single("file")], userController.upload_image_user);
router.get('/mostrar_imagen_user/:file', userController.mostrar_imagen_user);
router.get('/contador_user/:id', auth.auth, userController.contador_user);

// exportar router
module.exports = router;
