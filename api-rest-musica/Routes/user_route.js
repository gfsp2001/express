const express = require('express');
const router = express.Router();
const UserController = require('../Controllers/userController');
const { almacenamiento_img } = require('../middlewares/multer');
const auth = require('../Middlewares/auth');
const img = almacenamiento_img('avatars');

router.get('/prueba', UserController.prueba);
router.post('/registrar_user', UserController.registrar_user);
router.post('/login_user', UserController.login_user);
router.get('/profile_user/:id', auth.auth, UserController.profile_user);
router.put('/update_user', auth.auth, UserController.update_user);
router.post('/upload_image_user', [auth.auth, img.single("file")], UserController.upload_image_user);
router.get('/mostrar_imagen_user/:file', UserController.mostrar_imagen_user);


module.exports = router;