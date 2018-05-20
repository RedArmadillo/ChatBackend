const express = require('express');
const app = express();
let db = require('../utilities/utils').db;
var router = express.Router();
var request = require('request');

router.post("/sendMessages", (req, res) => {
    let username = req.body['username'];
    let message = req.body['message'];
    let chatId = req.body['chatId'];
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
        // res.send({
        //     success: true
        // });
        // I will change the callback such that it will push notification to other users
        // after message is sent
        let getUserToken = `select firebase_token
                    from members m left join chatmembers c
                        on m.memberid = c.memberid where c.chatid = $1;`
        db.manyOrNone(getUserToken, chatId)
        .then((rows)=> {
            let fullBody = new Object();
            let key1 = "to";
            let key2 = "collapse_key";
            let value2 = "type_a";
            let key3 = "notification";
            let value3 = {
                body : "You have new message(s) from ",
                title: "Red Armadillo"
            };
            fullBody[key1] = rows;
            fullBody[key2] = value2;
            fullBody[key3] = value3;
            // The options of POST request make by sendMessage to push notification after message sent
            let options = {
                url: 'https://fcm.googleapis.com/fcm/send',
                method: 'POST',
                body: JSON.stringify(fullBody),
                headers: {
                'Authorization' : 'key=AAAABwN1kqU:APA91bG8YPbMWrNfuZVIRyB1Wuy93gaTYiERpwKWydlnSBqBfhlWznL03RCDCOXVbXdAANqg9H0DY7Mxc9ZtHKRbx3WpaTJegacCsm_j7EhWaKTJl1khyLu9tF5-Kw_Xc6b34SY6ROtt',
                'Content-Type' : 'application/json',
                }
            };
            request(options, function (error, response, body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                console.log('body:', body)
            });
            res.send({
                success: true,
                message : "notification sent"
            });
        })
        .catch(err => {
            res.send({
                success: false,
                message: "fail to push notification"
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