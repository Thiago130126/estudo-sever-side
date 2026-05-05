var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
require('dotenv').config();

const flash = require('connect-flash');

// database
const sequelize = require('./config/database');
const Users = require('./modules/user/userModel');
const Books = require('./modules/books/bookModel');

Users.hasMany(Books, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Books.belongsTo(Users, { foreignKey: 'user_id' });

var indexRouter = require('./routes/index');

// Rotas
var indexRouter = require('./routes/index');
var accountRouter = require('./routes/account');
var admRouter = require('./routes/adm');
var bookRouter = require('./routes/books');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout/base')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

// primeiro middleware feito ('global')
// aqui que torna o flash disponível para todo o sistema? Deve ser aqui
app.use((req, res, next) => {
    // res.locals é o objeto de variáveis globais do EJS
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    res.locals.user = req.session.usuarioLogado || null;

    res.locals.currentPath = req.originalUrl;
    
    next(); // Avisa o Express para continuar o fluxo e ir para as rotas
});

// aqui eu defino o prefixo das rotas
app.use('/', indexRouter);
app.use('/account', accountRouter);
app.use('/admin', admRouter);
app.use('/books', bookRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
// aqui que torna o flash disponível para todo o sistema?
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// conexão com o db
sequelize.authenticate()
  .then(() => {
    console.log('Conexão com o postgreSQL feita com sucesso');
    return sequelize.sync({ alter:true });
  })
  .catch(err => {
    console.error('Erro ao conectar com o banco: ', err);
  });




module.exports = app;

