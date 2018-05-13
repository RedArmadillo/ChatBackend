//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();
const bodyParser = require("body-parser");

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

var router = express.Router();
router.use(bodyParser.json());

let temp;
router.get("/", (req, res) => {
    let name = req.query['username'];
 
    /*
    let query = `select chatid, message
    from messages m
    where memberid = (select memberid from members where username = $1)
    and timestamp = (select max(timestamp)
                    from messages
                    where messages.chatid = m.chatid)
                    order by timestamp DESC`;
                    */
    let secondQuery = `select c.chatid, m.message, r.name
    from chatmembers c left join messages m on (m.chatid = c.chatid) left join chats r on m.chatid = r.chatid
    where c.memberid = (select memberid from members where username=$1)
    and m.timestamp = (select max(timestamp) from messages where messages.chatid = m.chatid)
    order by timestamp DESC`;

    db.manyOrNone(secondQuery, [name])
    .then((rows) => {
        res.send({
            success : rows
        })
        console.log(rows);
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        })
    });
});

module.exports = router;

