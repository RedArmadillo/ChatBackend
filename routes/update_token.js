const express = require('express');
const bodyParser = require("body-parser");

let db = require('../utilities/utils').db;

var router = express.Router();

router.use(bodyParser.json());

/**
 * sets a member's firebase token
 */
router.post('/', (req, res) => {
    let u_name = req.body['username'];
    let token = req.body['token'];
    console.log("received token " + token + " for user " + u_name);
    db.none("update members set firebase_token = $1 where username = $2", [token, u_name])
    .then(()=>{
        res.send({
            success: true,
            message : "token updated"
        });
    })
    .catch(err => {
        res.send({
            success: false,
            message : "fail to update token"
        });
    });

});


module.exports = router;
