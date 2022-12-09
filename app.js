const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();
const cors = require('cors');
const corsOption = require('./config/corsOption');
const fileUpload = require('express-fileupload');
const rfs = require('rotating-file-stream');
const moment = require('moment');
const session = require('express-session');

const indexRouter = require('./routes/index');

global.__basedir = __dirname;

// error logger config
// const accessLogStream = rfs.createStream(`${moment().format()}.log`, {
//   size: '10M',
//   interval: '1d',
//   path: path.join(__dirname, "log"),
//   compress: 'gzip',
// });
// logger.token('json', (req, res) => req.error);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger(
//     ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status - message: ":json" - :res[content-length] ":referrer" ":user-agent"',
//     {
//       stream: accessLogStream,
//       skip: (req, res) => res.statusCode < 500,
//     }
//   )
// );
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: 'sou27',
    cookie: { maxAge: oneDay},
    saveUninitialized: true,
    resave: false,
  })
);

app.use(cors(corsOption()));
app.use(fileUpload());

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
