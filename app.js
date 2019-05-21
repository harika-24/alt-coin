var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var fileUpload = require('express-fileupload');

var mongoSecret = "mongodb://ray:pleasehack1@ds121636.mlab.com:21636/c2c";

var userRoute = require('./routes/routes');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(mongoSecret,(err)=>{
  if(err){
    console.log('Error in MLabs connection: ',err.message);
  }
  else{
    console.log('Now connected to mlabs');
  }
});


app.use('/',userRoute);


app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : '/tmp/'
}));

app.listen(3000,(err)=>{
  if(err){
    throw err;
  }
  console.log('the app is now up on port 3000');
})

module.exports = app;
