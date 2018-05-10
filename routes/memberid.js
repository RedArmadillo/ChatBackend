//express is the framework we're going to use to handle requests
const express = require('express');
const bodyParser = require("body-parser");

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

var router = express.Router();
router.use(bodyParser.json());

router.post("/", (req, res) => {
    let name = req.body['username'];

    db.one('select memberid from members where username = $1', [name])
    .then(row => {
        res.send({
            memberid : row.memberid
        })
    });
});

module.exports = router;