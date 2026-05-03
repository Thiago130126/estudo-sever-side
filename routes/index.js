var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'EduStream' });
});

router.get('/edu', function(req, res, next) {
  res.render('edu_stream', { title: 'EduStream' });
});

module.exports = router;

