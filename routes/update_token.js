const express = require('express');
const bodyParser = require("body-parser");

let db = require('../utilities/utils').db;

var router = express.Router();

router.use(bodyParser.json());

router.post('/', (req, res) => {
    let memberid = req.body['memberid'];
    let token = req.body['token'];
    db.none("update members set firebase_token = $1 where username = $2", [token, memberid])
    .then(()=>{
        res.send({
            success: true,
            message : "token updated"
        });
    })
    .catch(err => {
        res.send({
            success: false,
            message : "failt to update token"
        });
    });

});


module.exports = router;
