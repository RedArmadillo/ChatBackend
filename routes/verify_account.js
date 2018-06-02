const express = require('express');
const app = express();
const FormData = require("form-data");
const bodyParser = require("body-parser");

app.use(bodyParser.json());

let db = require('../utilities/utils').db;
// let getHash = require('../utilities/utils').getHash;
var router = express.Router();

/**
 * handles account verification using given secret
 */
router.get('/', (req, res) => {
    let secret = req.param("secret");

    if(secret) {
        db.one("SELECT Verified, Created FROM Members WHERE Secret=$1 AND Created >= now() - INTERVAL '1 DAY'", [secret])
        .then(row => {
            db.none("UPDATE Members SET Verified = TRUE WHERE Secret=$1", [secret]);
            res.send("<h2>Success! :)</h2><p>Thanks for verifying your account.</p>")
        })
        //More than one row shouldn't be found, since table has constraint on it
        .catch((err) => {
            //If anything happened, it wasn't successful
            res.send({
                success: false,
                message: "Verification was unsuccessful, please resend verification through your app"
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