var express = require('express');
var router = express.Router();

// controller
const bookControl = require('../modules/books/bookController');

// middleware
const authMid = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multer');
const { update } = require('../modules/books/bookModel');

router.get('/add', authMid.userAuth, (req, res, next) => {
    res.render('books/form_books');
});

router.post('/add', authMid.userAuth, upload.single('imagem_upload'), bookControl.addBook);

router.post('/delete/:id', authMid.userAuth, bookControl.deleteBook);

router.get('/edit/:id', authMid.userAuth, bookControl.editBook);

router.post('/edit/:id', authMid.userAuth, upload.single('imagem_upload'), bookControl.updateBook);




module.exports = router;


