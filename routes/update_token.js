const express = require('express');
const bodyParser = require("body-parser");

let db = require('../utilities/utils').db;

var router = express.Router();

router.use(bodyParser.json());

router.post('/', (req, res) => {
    let memberid = req.body['memberid'];
    let token = req.body['token'];
});


module.exports = router;
