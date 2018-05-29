const express = require('express');
const app = express();
let db = require('../utilities/utils').db;
let pushNoti = require('../utilities/push_noti.js').push_notification;
let pushNotiTopic = require('../utilities/push_noti.js').push_notification_topic;
var router = express.Router();
var request = require('request');

router.post("/sendMessages", (req, res) => {
    let username = req.body['username'];
    let message = req.body['message'];
    let chatId = req.body['chatId'];
    let roomName = req.body['roomname'];
    if(!username || !message || !chatId) {
        res.send({
            success: false,
            error: "Username, message, or chatId not supplied"
        });
        return;
    }
    let insert = `INSERT INTO Messages(ChatId, Message, MemberId)
    SELECT $1, $2, MemberId FROM Members
    WHERE Username=$3`
    db.none(insert, [chatId, message, username])
    .then(() => {
        // change the callback such that it will push notification to other users
        // after message is sent
        // We need all the users of the chat room
        let getUserToken = `select *
                    from members m left join chatmembers c
                        on m.memberid = c.memberid
                        where c.chatid = $1 and m.username != $2`;
        db.manyOrNone(getUserToken, [chatId, username])
        .then((rows)=> {
            // Pushing notification after message sent
            pushNoti(rows, message, username, roomName, chatId);
            //pushNotiTopic(rows, message, username, roomName, chatId);
            res.send({
                success: true,
                message : "notification sent"
            });
        })
        .catch(err => {
            res.send({
                success: false,
                message: "fail to push notification",
                error : err
            });
        });
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        });
    });
});

router.get("/getMessages", (req, res) => {
    let chatId = req.query['chatId'];
    let after = req.query['after'];
    let query = `SELECT Members.Username, Messages.Message, to_char(Messages.Timestamp AT TIME ZONE 'PDT', 'YYYY-MM-DD HH24:MI:SS.US' ) AS Timestamp
    FROM Messages
    INNER JOIN Members ON Messages.MemberId=Members.MemberId
    WHERE ChatId=$2 AND
    Timestamp AT TIME ZONE 'PDT' > $1
    ORDER BY Timestamp ASC`
    db.manyOrNone(query, [after, chatId])
    .then((rows) => {
        res.send({
            messages: rows
        })
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        })
    });
});

module.exports = router;