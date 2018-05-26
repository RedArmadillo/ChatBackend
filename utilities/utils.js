//Get the connection to Heroku Database
let db = require('./sql_conn.js');

//We use this create the SHA256 hash
const crypto = require("crypto");
const FormData = require("form-data");
function sendEmail(from, to, subject, message) {
//  let form = new FormData();
//  form.append("from", from);
//  form.append("to", to);
//  form.append("subject", subject);
//  form.append("message", message);
//  form.submit("http://cssgate.insttech.washington.edu/~cfb3/mail.php", (err, res) => {
//  if(err) console.error(err);
//  console.log(res);
//  });
}
/**
* Method to get a salted hash.
* We put this in its own method to keep consistency
* @param {string} pw the password to hash
* @param {string} salt the salt to use when hashing
*/
function getHash(pw, salt) {
    return crypto.createHash("sha256").update(pw + salt).digest("hex");
}

function generateSecret() {
    let random_bytes = crypto.randomBytes(32).toString("hex");
    let hash = getHash(random_bytes);
    return hash.substring(0, 32);
}

function generate6DigitsSecret() {
    let random_bytes = crypto.randomBytes(32).toString("hex");
    let hash = getHash(random_bytes);
    return hash.substring(0, 6);
}
// base_url = "https://group7-chatapp.herokuapp.com/";
base_url = process.env.BASE_URL;


module.exports = {
 db, getHash, sendEmail, generateSecret, base_url, generate6DigitsSecret
};