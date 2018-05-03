const express = require('express');
const app = express();
const FormData = require("form-data");
const bodyParser = require("body-parser");

app.use(bodyParser.json());

let db = require('../utilities/utils').db;
// let getHash = require('../utilities/utils').getHash;
var router = express.Router();

router.post('/', (req, res) => {
    let secret = req.param("secret");
    if(secret) {
        //Using the 'one' method means that only one row should be returned
        db.one("SELECT Verified, Created FROM Verification WHERE Secret=$1 AND Created >= now() - INTERVAL '2 DAYS'", [secret])
        //If successful, run function passed into .then()
        .then(row => {
            db.none("UPDATE Verification SET Verified = TRUE WHERE Secret=$1", [secret]);
            res.send({
                success: true
            })
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
            message: 'no secret provided'
        });
    }
});
module.exports = router;