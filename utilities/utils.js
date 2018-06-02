//Get the connection to Heroku Database
let db = require('./sql_conn.js');

//We use this create the SHA256 hash
const crypto = require("crypto");
const FormData = require("form-data");
function sendEmail(from, to, subject, message) {
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