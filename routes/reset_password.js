const express = require('express');
//Create a new instance of express
const app = express();
const bodyParser = require("body-parser");

const db = require('../utilities/utils').db;
var router = express.Router();
var request = require('request');
var getHash = require('../utilities/utils').getHash;
const crypto = require("crypto");

let generateToken = require('../utilities/utils').generate6DigitsSecret;
let sendToken = require('../utilities/send_reset_password_token');


router.post('/', (req, res) => {
    res.type("application/json");
    //Retrieve data from query params
    var username = req.body['username'];
    var oldPassword = req.body['oldpassword'];
    var newPassword = req.body['newpassword'];
    
    db.one('SELECT Password, Salt FROM Members WHERE Username=$1', [username])
    // //If successful, run function passed into .then()
    .then(row => {
        let salt = row['salt'];
        let ourSaltedHash = row['password']; //Retrieve our copy of the password
        let theirSaltedHash = getHash(oldPassword, salt); //Combined theirpassword with our salt, then hash
        let isCorrectPw = ourSaltedHash === theirSaltedHash; //Did oursalted hash match their salted hash?
        //Send whether they had the correct password or not
        // Only allow change password if old pw matches
        if (isCorrectPw) {
            let newSalt = crypto.randomBytes(32).toString("hex");
            let salted_hash = getHash(newPassword, newSalt);
            let params = [salted_hash, newSalt, username];
            let updatePWQuery = "update Members set password=$1, salt=$2 where username=$3";
            db.none(updatePWQuery, params)
            .then(()=> {
                res.send( {
                    success : true,
                    message: "password updated successfully"
                });
            })
            .catch(err =>{
                res.send( {
                    success : false,
                    message: "failed to update passwords",
                    error : err
                });
            }); 
        } else {
            res.send( {
                success : false,
                message: "Wrong old password",
                error : err
            });
        }
    })
    .catch(err =>{
        res.send( {
            success : false,
            message: "Unable to retrieve information from server",
            error : err
        });
    });
});

/*** This service is called when user first clicks to request token 
 * */
router.post('/requestToken', (req, res) => {
    let username = req.body['username'];
    db.one("select email from Members where username=$1", username)
    .then(row => {
        let token = generateToken();
        sendToken(username, row.email, token);
        res.send({
            success : true
        });
    })
    .catch(err =>{
        res.send({
            success : false
        });
    });
    

});

// This service will be called after user input their given token and new password from inside the app
router.post('/forgot', (req, res) => {
    res.type("application/json");
    //Retrieve data from query params
    var username = req.body['username'];
    var token = req.body['token'];
    var newPassword = req.body['newpassword'];
    
    db.one('SELECT Token FROM Members WHERE Username=$1', [username])
    // //If successful, run function passed into .then()
    .then(row => {
        let serverToken = row.token;
        let isCorrectToken = serverToken === token; 
        // Only allow change password if their input token matches the token on server
        if (isCorrectToken) {
            console.log("correct token");
            // get them new Salt and hash password
            let newSalt = crypto.randomBytes(32).toString("hex");
            let salted_hash = getHash(newPassword, newSalt);
            let params = [salted_hash, newSalt, username];
            let updatePWQuery = "update Members set password=$1, salt=$2 where username=$3";
            db.none(updatePWQuery, params)
            .then(()=> {
                res.send( {
                    success : true,
                    message: "password updated successfully"
                });
            })
            .catch(err =>{
                res.send( {
                    success : false,
                    message: "failed to update passwords",
                    error : err
                });
            }); 
            return;
        } else {
            res.send( {
                success : false,
                message: "Wrong old password",
                error : err
            });
            return;
        }
    })
    .catch(err =>{
        res.send( {
            success : false,
            message: "Unable to retrieve information from server",
            error : err
        });
    });
});

function update(username) {
    let newSalt = crypto.randomBytes(32).toString("hex");
    let salted_hash = getHash(newPassword, newSalt);
    let params = [salted_hash, newSalt, username];
    let updatePWQuery = "update Members set password=$1, salt=$2 where username=$3";
    db.none(updatePWQuery, params)
    .then(()=> {
        return {
            success : true,
            message: "password updated successfully"
        }
    })
    .catch(err =>{
        return {
            success : false,
            message: "failed to update passwords",
            error : err
        }
    }); 
}

module.exports = router;