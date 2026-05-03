var express = require('express');
var router = express.Router();

// controllers
const userController = require('../modules/user/userController');

router.post('/register', userController.createUser);

router.get('/register', function(req, res, next) {
    res.render('account/register');
});

module.exports = router;

