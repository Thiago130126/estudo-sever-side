var express = require('express');
var router = express.Router();

// controllers
const userController = require('../modules/user/userController');

// middlewares
const authMidd = require('../middlewares/authMiddleware');

router.post('/register', userController.createUser);

router.get('/register', function(req, res, next) {
    res.render('account/register');
});

router.get('/login', function(req, res, next) {
    res.render('account/login');
});

router.post('/login', userController.loginUser);

router.get('/logout', userController.logoutUser);

router.get('/profile', authMidd.userAuth, function(req, res, next) {
    res.render('account/profile');
});

module.exports = router;

