// /* INIT */
// const express = require('express');
// const app = express();
// const FormData = require("form-data");
// const bodyParser = require("body-parser");
// app.use(bodyParser.json());
// let db = require('../utilities/utils').db;
// var router = express.Router();

// /* ROUTING */
// router.post('/', (req, res) => {
//     // Get the json data to post a message
//     let chat = req.body['chatid'];
//     let member = req.body['memberid'];
//     let time = req.body['timestamp'];
//     let message = req.body['message'];
//     let wasSuccessful = false;

//     if(user && chat && member && time && message) {

        
//         //If successful, run function passed into .then()
//         .then(row => {
//             let salt = row['salt'];
//             let ourSaltedHash = row['password']; //Retrieve our copy of the password
//             let theirSaltedHash = getHash(theirPw, salt); //Combined theirpassword with our salt, then hash
//             let wasCorrectPw = ourSaltedHash === theirSaltedHash; //Did oursalted hash match their salted hash?
//             //Send whether they had the correct password or not
//             res.send({
//                 success: wasCorrectPw
//             });
//         })
//         //More than one row shouldn't be found, since table has constraint on it
//         .catch((err) => {
//             //If anything happened, it wasn't successful
//             res.send({
//                 success: false,
//                 message: err
//             });
//         });
//         } else {
//         res.send({
//             success: false,
//             message: 'missing credentials'
//         });
//     }
// });
// module.exports = router;

// /*

// DROP TABLE IF EXISTS Messages;
// CREATE TABLE Messages (PrimaryKey SERIAL PRIMARY KEY,
//                        ChatID INT,
//                        Message VARCHAR(255),
//                        MemberID INT,
//                        FOREIGN KEY(MemberID) REFERENCES Members(MemberID),
//                        FOREIGN KEY(ChatID) REFERENCES Chats(ChatID),
//                        TimeStamp TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp
// );
// */