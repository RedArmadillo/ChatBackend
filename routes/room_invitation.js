//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();
const bodyParser = require("body-parser");

let db = require('../utilities/utils').db;

var router = express.Router();

router.use(bodyParser.json());


// Service to get all Invitations 
router.get("/", (req, res) => {
    let receiverid = req.query['memberid'];
    let query = `select c.name, m.username, c.chatid
        from chats c left join invitations i on c.chatid = i.roomid
        left join members m on i.senderid = m.memberid
        where i.receiverid = $1 and i.verified = false;`

    db.manyOrNone(query, [receiverid])
    .then((rows) => {
        res.send({
            invitations : rows
        })
        console.log(rows);
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        })
    });
});

// Service to send an invitation
router.post("/", (req, res) => {
    let sender = req.body['sender'];
    let receiver = req.body['receiver'];
    let ID = req.body['chatid'];

    let query = `INSERT INTO Invitations(SenderId, ReceiverId, Roomid)
                VALUES
                ((SELECT MemberId FROM Members WHERE Username = $1),
                (SELECT MemberId FROM Members WHERE Username = $2),
                $3)`;
    let params = [sender, receiver, ID];
    let checkIfUserExists = `select * from chatmembers
                            where chatid = $1
                            and memberid = (select memberid from members where username = $2)`;
    // Check if other already in the room
     db.oneOrNone(checkIfUserExists, [ID, receiver])
    .then((row) => {
        if (!row) {
            // continue to check if an invitation has been sent
            db.oneOrNone(checkIfInvitationExists, params)
            .then((row) =>{
                // OK, no invitation any kind btw 
                if (!otherRow) {
                    // send 
                    db.none(query, params)
                    .then(()=>{
                        res.send({
                            success: true,
                            message : "invitation sent"
                        });
                    })
                    .catch((err) =>{
                        res.send({
                            success: false,
                            message : "cannot send invitation"
                        });
                    });
                } else {// there's already an invitation 
                    res.send({
                        success: false,
                        message : "such invitation has been sent"
                    });
                } 
            })
            .catch((err)=>{
                res.send({
                    success: false,
                    error : "fail to check if such invitation already exists"
                });
            });
        // Now case other user already in the room      
        } else {
            res.send({
                success: false,
                message : "They're already here!"
            });

        }
    })
    .catch(err =>{
        res.send({
            success: false,
            error : "fail to check if user already in the room"
        });
    });

    

    //let secondQuery = `INSERT INTO ChatMembers(ChatId, MemberId)
    //        VALUES ($1, (SELECT MemberId FROM Members WHERE Username = $2))`;
    //let params =  [ID, receiver];      
    // db.none(secondQuery, params)
    // .then(() => {
    //     res.send({
    //         success: true
    //     });
    // })
    // .catch(err => {
    //     res.send({
    //         success: false,
    //         error: err,
    //     });
    // });
});

// Service to accept to an invitation

module.exports = router;