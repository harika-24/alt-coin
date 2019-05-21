
var queryExecutor = require('../query');
var invoke = require('../invoke-func');
const crypto = require("crypto");

const secret = "altcoin";
function gethash(data) {
    const hash = crypto
        .createHmac("sha256", secret)
        .update(data)
        .digest("hex");
    return hash;
}

cid = "cert_ba1e90d5de978b28c82d7ebaf2a7768a597d9d38d49e024b75c5c42c93e9aad6"

let response = await queryExecutor.queryn(cid);

console.log("Returnded response is " + response );

