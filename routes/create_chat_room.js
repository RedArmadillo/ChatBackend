//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

var router = express.Router();
var id;

router.post("/", (req, res) => {
    let name = req.body['room name'];
    let uname = req.body['username'];
    let insertNewRoom = 'insert into chats(name) values ($1) returning chatid';
    let secondQuery =  `INSERT INTO Messages(ChatId, Message, MemberId)
    SELECT $1, $2, MemberId FROM Members 
    WHERE Username=$3;`;
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

