var express = require('express');
var router = express.Router();

var User = require('../models/userModel');
var certID = require('../models/certID');
var queryExecutor = require('../query');
var invoke = require('../invoke-func');
const crypto = require("crypto");

const secret = "altcoin";
function gethash(data) {
    var hash = crypto
        .createHmac("sha256", secret)
        .update(data)
        .digest("hex");
    hash = 'cert_' + hash;
    return hash;
}

//
// ─── BULK VALIDATION ────────────────────────────────────────────────────────────
//

var csv = require('csv-array');
var queryExecutor = require('../query');

var validityCheck = [];
function getData(){
    return new Promise(resolve => {
    csv.parseCSV("public/assets/bulkVerify.csv", function (data) {
        resolve(data);
    }, false);
});
}

function checkValidity(certIds){
    return new Promise(resolve => {
    certIds.forEach(async function (cert) {
        let qresponse = await queryExecutor.queryn(cert);
        if (qresponse.success) {
            validityCheck.push(true);
        }
        else {
            validityCheck.push(false);
        }
        if(validityCheck.length == certIds.length){
            resolve(validityCheck);
        }
        console.log('Cert Id = ' + cert + " \t Validity = " + qresponse.success );
    })
    });
}

async function checkBulk(){
    var certIds = await getData();
    var result = await checkValidity(certIds);
    console.log("result is --- > " + result);
}
// checkBulk();

//
// ─── END OF BULK FUNCTIONS ──────────────────────────────────────────────────────
//


/**
 * Get login form
 */
router.get('/', (req, res) => {
    res.render('index', {'formError': false})
});
router.get('/login', (req, res) => {
    res.render('index', {'formError': false})
});

router.post('/login', (req, res) => {
    var userName = req.body.userName;
    var password = req.body.password;
    if(userName != "admin@alt-coin.cf" || password != "password"){
        res.render('index', {'formError': true, 'message': 'Please enter the valid credentials'})
    }

    var type = req.body.type;

    console.log(type);

    if (type.toLowerCase() === "institute") {
        res.redirect('/institute');
        // res.render('form2');
    }
    else if (type.toLowerCase() === "company") {
        res.redirect('/company');
        // res.render('form1');
    }
});


// ********************************************************************************
// ─── INSTITUTE ROUTES ───────────────────────────────────────────────────────────
// ********************************************************************************
router.get('/institute', (req, res) => {
    res.render('institute');
});

router.get('/institute/add', (req, res) => {
    res.render('addCert');
});

router.get('/institute/verify', (req, res) => {
    res.render('verifyCert');
});

router.get('/institute/certificates', (req, res) => {
    res.render('instituteCerts');
});

// ********************************************************************************
// ─── COMPANY ROUTES ───────────────────────────────────────────────────────────
// ********************************************************************************

router.get('/company', (req, res) => {
    res.render('company');
});

router.get('/company/verify', (req, res) => {
    res.render('verifyCert');
});

router.get('/company/bulkVerify', (req, res) => {
    res.render('bulkVerify');
});

router.post('/bulkVerify', async(req, res) => {
    console.log(req.files);
    // res.send(req.files.certIDsFile.tempFilePath);
    // TODO- GET FILE AND SEND TO GET DATA
    var certIds = await getData();
    var result = await checkValidity(certIds);
    console.log("result is --- > " + result);
    res.render('bulkVerifyResult', {certIds: certIds, result: result});
    res.render('bulkVerifyResult');
});



//     cert4.receipient = 'Rajesh';
//     cert4.regno = '21345689';
//     cert4.cgpa = '8.8';
//     cert4.type = 'Bachelor of Technology';
//     cert4.branch = 'Computer Science and Engineering';
//     cert4.enrollmentYear = 2016;
//     cert4.graduationYear = 2020;
//     cert4.issuer = 'altcoinadmin@srmuniv.ac.in'; // foreign key of institute
//     cert4.status = 'OK';


router.post('/verifyCertificate', async (req, res) => {
    const cid = req.body.cid;
    let response = await queryExecutor.queryn(cid);
    if (response.success) {
        res.send('Successful : ' + response.message);
    }
    else {
        res.send('Failed : ' + response.message);
    }
});

router.post('/addCertificate', async (req, res) => {
    var dataArray = new Array();

    // fetching all values from the form response
    dataArray[0] = 'hashsecret';
    dataArray[1] = req.body.recipient;
    dataArray[2] = req.body.regno;
    dataArray[3] = req.body.cgpa;
    dataArray[4] = req.body.type;
    dataArray[5] = req.body.branch;
    dataArray[6] = req.body.enrollmentYear;
    dataArray[7] = req.body.graduationYear;
    dataArray[8] = req.body.issuer; // foreign key of institute
    dataArray[9] = 'OK';

    // const buff = Buffer.from(dataArray);
    console.log("******************* " + dataArray.join() + "\n");

    var hash = gethash(dataArray.join());
    dataArray[0] = hash;

    const cid = hash;
    let qresponse = await queryExecutor.queryn(cid);
    if (qresponse.success) {
        res.send('ALREAY EXISTS: A certificate for this already exists');
    }
    else {
        let response = await invoke.access('addCert', dataArray);
        if (response.success) {
            var newUser = new User({
                email: "demo username",
                password: "demo password",
                userType: "demo userType"
            });
            res.send('Successful : added certificate with cId : ' + hash);
        }
        else {
            res.send('Failed ' + response.message);
        }
    }


});

router.get('*', function(req, res){
    res.render('404');
});


module.exports = router;