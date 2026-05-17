var express = require('express');
var router = express.Router();

const profileController = require('../modules/user/profileController');

//Middlewares
const authMidd = require('../middlewares/authMiddleware');

router.get('/explorer', authMidd.userAuth, profileController.explorer);

router.get('/usuario/:id', authMidd.userAuth, profileController.getProfile);

router.post('/favoritar/:id', authMidd.userAuth, profileController.favoritar);

module.exports = router;