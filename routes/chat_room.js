const express = require('express');
const app = express();
const bodyParser = require("body-parser");

let db = require('../utilities/utils').db;

var router = express.Router();

router.use(bodyParser.json());

let temp;
var id;

// Service to get all the chat rooms a user are in
router.get("/", (req, res) => {
    let name = req.query['username'];
 
    let query = `select chatid, message
    from messages m
    where memberid = (select memberid from members where username = $1)
    and timestamp = (select max(timestamp)
                    from messages
                    where messages.chatid = m.chatid)
                    order by timestamp DESC`;
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


// Service to create a new chat room
router.post("/", (req, res) => {
    let name = req.body['room name'];
    let uname = req.body['username'];
    let insertNewRoom = 'insert into chats(name) values ($1) returning chatid';
    let insertWelcomMessage = `INSERT INTO Messages(ChatId, Message, MemberId)
    SELECT $1, $2, MemberId FROM Members 
    WHERE Username=$3`;
    let insertIntoChatMember = `INSERT INTO ChatMembers(chatid, memberid)
    VALUES 
    ($1, (select MemberId FROM Members 
        WHERE Username=$2))`;
    //secondQuery+= insertIntoChatMember;    
    db.one(insertNewRoom, [name])
    .then(row => {
        id = row.chatid;
        res.send({
            success: true,
            newchatid: row.chatid,
        });
        
        return db.none(insertIntoChatMember, [id, uname]);        
    })
    .then(() => {
        console.log(id);
        console.log("inserted into ChatMembers");
        let welcome = "welcome!"
        db.none(insertWelcomMessage, [id, welcome, uname]);
    })
    .then(() => {
        console.log("inserted into Messages");
    })
    .catch((err) => {
        res.send({
            success: false,
            error: err,
        });
    }); 
});
module.exports = router;