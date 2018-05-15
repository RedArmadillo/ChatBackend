const express = require('express');
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
let db = require('../utilities/utils').db;
var router = express.Router();

/*
Accept a new friend request. Joy.
*/
router.post('/:username_a/accept/', (req, res) => {
    let username_a = req.param("username_a");
    let username_b = req.body["username_b"];

    console.log(username_a);
    console.log(username_b);

    if (username_a && username_b) {

        // check to make sure both users exist
        db.many("SELECT Username, MemberID FROM Members WHERE Username=$1 OR Username=$2", [username_a, username_b])
        .then( (rows) => {
            
            let memberID_a = null;
            let memberID_b = null;

            if (rows[0]["username"] == username_a) {
                memberID_a = rows[0]["memberid"];
                memberID_b = rows[1]["memberid"];
            } else {
                memberID_a = rows[1]["memberid"];
                memberID_b = rows[0]["memberid"];
            }

            let params = [memberID_a, memberID_b];

            // Let's check if user B already sent user A a request
            db.one("SELECT MemberID_A, MemberID_B, Verified FROM Contacts WHERE MemberID_A=$2 AND MemberID_B=$1", params)
            .then( (verify_rows) => {

                db.none("UPDATE Contacts SET Verified=1 WHERE MemberID_A=$2 AND MemberID_B=$1", params).then(() => {
                    res.send({
                        success: true,
                        message: "contacts verified, friend request accepted"
                    });
                });
            })
            .catch((err) => {
                res.send({
                    success: false,
                    message: "user b hasn't sent a request to user a"
                });
            });
        })
        .catch((err) => {
            res.send({
                success: false,
                message: "one of the usernames does not exist"
            });
        });
    } else {
        res.send({
            success: false,
            message: "missing required information"
        });
    }

});

/*
Reject a friend request. Womp womp.
*/
router.post('/:username_a/reject/', (req, res) => {
    let username_a = req.param("username_a");
    let username_b = req.body["username_b"];

    if (username_a && username_b) {

        // check to make sure both users exist
        db.many("SELECT Username, MemberID FROM Members WHERE Username=$1 OR Username=$2", [username_a, username_b])
        .then( (rows) => {

            let memberID_a = null;
            let memberID_b = null;

            if (rows[0]["username"] == username_a) {
                memberID_a = rows[0]["memberid"];
                memberID_b = rows[1]["memberid"];
            } else {
                memberID_a = rows[1]["memberid"];
                memberID_b = rows[0]["memberid"];
            }

            let params = [memberID_a, memberID_b];

            // Let's check if user B already sent user A a request
            db.one("SELECT MemberID_A, MemberID_B, Verified FROM Contacts WHERE MemberID_A=$2 AND MemberID_B=$1", params)
            .then( (verify_rows) => {

                db.none("UPDATE Contacts SET Verified=-1 WHERE MemberID_A=$2 AND MemberID_B=$1", params).then(() => {
                    res.send({
                        success: true,
                        message: "contact request rejected"
                    });
                });
            })
            .catch((err) => {
                res.send({
                    success: false,
                    message: "user b hasn't sent a request to user a"
                });
            });
        })
        .catch((err) => {
            res.send({
                success: false,
                message: "one of the usernames does not exist"
            });
        });
    } else {
        res.send({
            success: false,
            message: "missing required information"
        });
    }

});

/*
Request friendship. Yay.
*/
router.post('/:username_a/request/', (req, res) => {
    let username_a = req.param("username_a");
    let username_b = req.body["username_b"];

    if (username_a && username_b) {

        // check to make sure both users exist
        db.many("SELECT Username, MemberID FROM Members WHERE (Username=$1 OR Username=$2)", [username_a, username_b])
        .then( (rows) => {

            let memberID_a = null;
            let memberID_b = null;

            if (rows[0]["username"] == username_a) {
                memberID_a = rows[0]["memberid"];
                memberID_b = rows[1]["memberid"];
            } else {
                memberID_a = rows[1]["memberid"];
                memberID_b = rows[0]["memberid"];
            }

            let params = [memberID_a, memberID_b];

            db.none("INSERT INTO Contacts(MemberID_A, MemberID_B) VALUES ($1, $2)", params)
            .then(
                res.send({
                    success: true,
                    message: "friend request sent"
                })
            );
        })    
        .catch((err) => {
            res.send({
                success: false,
                message: "one of the usernames does not exist"
            });
        });
    } else {
        res.send({
            success: false,
            message: "missing required information"
        });
    }
});

// GET a contact's connections
/*
ON SUCCESS:
success: true
verified: the list of verified connections returned by the database
pending: the list of pending connections returned by the database

ON FAILURE:
success: false
message: human-readable message
error: error trace

Failure may also return 'input' containing the required fields that were not supplied
*/
router.get('/:username/', (req, res) => {
    let username = req.param("username");

    if (username) {
        db.one("SELECT MemberID FROM Members WHERE Username=$1", [username])
        .then( members_row => {
            let userid = members_row["memberid"];
            db.any("SELECT MemberID_A, MemberID_B, Verified FROM Contacts WHERE (MemberID_A=$1 OR MemberID_B=$1) AND Verified=1", [userid])
            .then((verified_rows) => {
                db.any("SELECT MemberID_A, MemberID_B, Verified FROM Contacts WHERE MemberID_A=$1 AND Verified=0", [userid])
                .then((outgoing_rows) => {
                    db.any("SELECT MemberID_A, MemberID_B, Verified FROM Contacts WHERE MemberID_B=$1 AND Verified=0", [userid])
                    .then((incoming_rows) => {

                        res.send({
                            success: true,
                            verified: verified_rows,
                            outgoing: outgoing_rows,
                            incoming: incoming_rows
                        });
                    });
                })
                .catch((err) => {
                    res.send({
                        success: false,
                        error: err
                    });
                });
            })
            .catch((err) => {
                res.send({
                    success: false,
                    error: err
                });
            });
        })
        .catch((err) => {
            res.send({
                success: false,
                message: "No user found by that username",
                error: err
            });
        });
    } else {
        res.send({
            success: false,
            input: req.body,
            message: "Missing username"
        });
    }
});


// not yet implemented
// // UPDATE a contact connection
// // The Verified column is an int. 0 DEFAULT denotes an unconfirmed request, a 1 is confirmed, a -1 is declined
// /*
// ON SUCCESS:
// success: true
// verified: the new verified status
// message: human-readable success case

// ON FAILURE:
// success: false
// message: human-readable message
// error: error trace

// Failure may also return 'input' containing the required fields that were not supplied
// */
// router.put('/', (req, res) => {
//     let username_a = req.body["username_a"];
//     let username_b = req.body["username_b"];
//     let new_status = req.body["new_status"]

//     if (username_a && username_b && new_status) {
//         db.one("SELECT MemberID FROM Members WHERE Username=$1", [username_a])
//         .then( un_a => {
//             let userid_a = un_a["memberid"];
//             db.one("SELECT MemberID FROM Members WHERE Username=$1", [username_b])
//             .then( un_b => {
//                 let userid_b = un_b["memberid"];
//                 let params = [userid_a, userid_b, new_status];
//                 db.none("UPDATE Contacts SET Verified=$3 WHERE (MemberID_A=$1 AND MemberID_B=$2) OR (MemberID_A=$2 AND MemberID_B=$1)", params)
//                 .then(() => {
//                     res.send({
//                         success: true,
//                         message: "status updated"
//                     });
//                 })
//                 .catch((err) => {
//                     res.send({
//                         success:false,
//                         error:err
//                     });
//                 });
//             })
//             .catch((err) => {
//                 res.send({
//                     success:false,
//                     error:err
//                 })
//             });
//         })
//         .catch((err) => {
//             res.send({
//                 success:false,
//                 error:err
//             })
//         });
//     } else {
//         res.send({
//             success: false,
//             input: req.body,
//             message: "Missing username"
//         })
//     }
// });

module.exports = router;