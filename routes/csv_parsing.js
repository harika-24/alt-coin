

var csv = require('csv-array');
var queryExecutor = require('../query');

var validityCheck = [];
function getData(){
    return new Promise(resolve => {
    csv.parseCSV("../public/assets/bulkVerify.csv", function (data) {
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

checkBulk();