const express = require('express');
const router = express.Router();
const followController = require('../Controllers/followController');
const auth = require('../middlewares/auth');

// definir rutas
router.get('/pruebaFollow', followController.pruebaFollow);
router.post('/guardar_follow_user', auth.auth, followController.guardar_follow_user);
router.delete('/unfollow_user/:id', auth.auth, followController.unfollow_user);
router.get('/following/:id?/:page?', auth.auth, followController.following);
router.get('/followers/:id?/:page?', auth.auth, followController.followers);

// exportar router
module.exports = router;