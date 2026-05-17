var express = require('express');
var router = express.Router();

// Middlewares
const authMidd = require('../middlewares/authMiddleware');
const Books = require('../modules/books/bookModel');

// Controller
const bookControl = require('../modules/books/bookController');
const admControl = require('../modules/user/admController');

router.get('/', authMidd.admAuth, admControl.dashboardAdm);

router.post('/limpar-lixo', authMidd.admAuth, bookControl.coletorLixoImagens);

router.get('/usuario/:id', authMidd.admAuth, admControl.getAccount);

router.post('/usuario/:id', authMidd.admAuth, admControl.updateAccount);

router.post('/usuario/:id/excluir', authMidd.admAuth, admControl.deleteAccount);

module.exports = router;
