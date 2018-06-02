const express = require('express');
const app = express();
var router = express.Router();

let db = require('../utilities/utils').db;
let sendVerification = require('../utilities/send_verification');
let generateSecret = require('../utilities/utils').generateSecret;

/**
 * resets a verification secret and resends a verification email with a new secret
 */
router.put('/', (req, res) => {
    res.type("application/json");

    let email = req.param("email");
    db.one("SELECT Username FROM Members WHERE Email=$1", [email])
    .then(row => {
        let username = row["username"];
        let secret = generateSecret();
        sendVerification(username, email, secret);

        res.send({
            success: true
        });

    })
    .catch( (err) => {
        res.send({
            success: false,
            message: err
        })
    });
});

module.exports = router;