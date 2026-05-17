var express = require('express');
var router = express.Router();

// Controller
const bookControl = require('../modules/books/bookController');

/* GET home page. */
router.get('/', bookControl.getLivro);

router.get('/edu', function(req, res, next) {
  res.render('/edu_stream', { title: 'EduStream' });
});

// Rota que exibe a página de teste na tela
router.get('/fim', (req, res) => {
    res.render('teste-audio', { title: 'Teste de Streaming' });
});

// A rota do streaming de dados (que o player <audio> vai chamar)
router.get('/streaming', bookControl.streaming);

module.exports = router;

