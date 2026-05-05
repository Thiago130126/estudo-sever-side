var express = require('express');
var router = express.Router();

// Controller
const bookControl = require('../modules/books/bookController');

/* GET home page. */
router.get('/', bookControl.getLivro);

router.get('/edu', function(req, res, next) {
  res.render('edu_stream', { title: 'EduStream' });
});

module.exports = router;

