const mongoose = require('mongoose');
var Schema= mongoose.Schema;

var UserModel = new Schema({
    email:String,
    password:String,
    userType:String
});

module.exports = mongoose.model('UserData',UserModel);