//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();
const FormData = require("form-data");
const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());
//Create connection to Heroku Database
let db = require('../utilities/utils').db;
let getHash = require('../utilities/utils').getHash;
var router = express.Router();
//app.get('/users') means accept http 'GET' requests at path '/users'
router.post('/', (req, res) => {
    let user = req.body['username'];
    let theirPw = req.body['password'];
    let wasSuccessful = false;
    if(user && theirPw) {
        //Using the 'one' method means that only one row should be returned
        db.one('SELECT Password, Salt FROM Members WHERE Username=$1', [user])
        //If successful, run function passed into .then()
        .then(row => {
            let salt = row['salt'];
            let ourSaltedHash = row['password']; //Retrieve our copy of the password
            let theirSaltedHash = getHash(theirPw, salt); //Combined theirpassword with our salt, then hash
            let isCorrectPw = ourSaltedHash === theirSaltedHash; //Did oursalted hash match their salted hash?
            //Send whether they had the correct password or not

            if (isCorrectPw) {

                db.one("SELECT Verified FROM Members WHERE Username=$1", [user])
                .then(row => {
                    let isVerified = row["verified"];
                    if (isVerified) {
                        res.send({
                            success:isCorrectPw && isVerified,
                            message: "login successful"
                        })
                    } else {
                        res.send({
                            success: isVerified,
                            message: "account not verified"
                        })
                    }
                })
                .catch()
            } else {
                res.send({
                    success: isCorrectPw,
                    message: "incorrect password"
                })
            }
            
        })
        //More than one row shouldn't be found, since table has constraint on it
        .catch((err) => {
            //If anything happened, it wasn't successful
            res.send({
                success: false,
                message: err
            });
        });
        } else {
        res.send({
            success: false,
            message: 'missing credentials'
        });
    }
});
module.exports = router;