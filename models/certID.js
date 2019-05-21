const mongoose = require('mongoose');
var Schema= mongoose.Schema;

var certID = new Schema({
    cert_id:String,
    regNo:String,
    instEmail:String,
});

module.exports = mongoose.model('certIDModel',certID);