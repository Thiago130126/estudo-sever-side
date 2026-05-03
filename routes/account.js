var express = require('express');
var router = express.Router();

// controllers
const userController = require('../modules/user/userController');

router.post('/register', userController.createUser);

router.get('/register', function(req, res, next) {
    res.render('account/register');
});

router.get('/login', function(req, res, next) {
    res.render('account/login');
});

router.post('/login', userController.loginUser);

router.get('/logout', userController.logoutUser);

module.exports = router;

