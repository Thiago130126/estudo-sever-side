var express = require('express');
var router = express.Router();

// Middlewares
const authMidd = require('../middlewares/authMiddleware');

router.get('/', authMidd.admAuth, (req, res) => {
    res.render('adm/index', { title: 'Painel Administrativo' });
});

module.exports = router;