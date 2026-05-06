var express = require('express');
var router = express.Router();

// Middlewares
const authMidd = require('../middlewares/authMiddleware');
const Books = require('../modules/books/bookModel');

// Controller
const bookControl = require('../modules/books/bookController');

router.get('/', authMidd.admAuth, (req, res) => {
    res.render('adm/index', { title: 'Painel Administrativo' });
});

router.post('/limpar-lixo', authMidd.admAuth, bookControl.coletorLixoImagens);

module.exports = router;