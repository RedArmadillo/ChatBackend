//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();
const bodyParser = require("body-parser");

let db = require('../utilities/utils').db;

var router = express.Router();

router.use(bodyParser.json());


// Service to respond to an Invitation
router.put("/", (req, res) => {
    let userid = req.body['userid'];
    let chatid = req.body['chatid'];
    let accept = req.body['accept']

    if(accept) {
        let query = `update invitations set verified = true where receiverid = $1 and roomid = $2`;
        db.none(query, [userid, chatid])
        .then(() => {
            res.send({
                success: true
            });
        })
        .catch(err => {
            res.send({
                success: false,
                error: err,
            });
        });
    } else {
        let query = `delete from invitations where receiverid = $1 and roomid = $2`;
        db.none(query, [userid, chatid])
        .then(() => {
            res.send({
                success: true
            });
        })
        .catch(err => {
            res.send({
                success: false,
                error: err,
            });
        });
    }
});    
module.exports = router;