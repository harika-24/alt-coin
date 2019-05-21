var User = require('../models/userModel');
var mongoSecret = "mongodb://ray:pleasehack1@ds121636.mlab.com:21636/c2c";
var mongoose = require('mongoose');
mongoose.connect(mongoSecret,(err)=>{
    if(err){
      console.log('Error in MLabs connection: ',err.message);
    }
    else{
      console.log('Now connected to mlabs');
    }
  });
var jsonArray = [
    {
        email:"email1@gmail.com",
        password:"haxx",
        userType:"institute"
    },
    {
        email:"email2@gmail.com",
        password:"maxx",
        userType:"university"
    },
    {
        email:"email3@gmail.com",
        password:"taxx",
        userType:"university"
    }
]

async function addData(){
    var userArray = new Array();
    jsonArray.forEach(async(e)=>{
        userArray.push(new User(e));
    });

    User.collection.insert(userArray,(err,doc)=>{
        if(err){
            console.log("err"+err);
        }
        else{
            console.log(doc)
        }
    })
}

addData();