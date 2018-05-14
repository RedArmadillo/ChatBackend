const express = require('express');
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
let db = require('../utilities/utils').db;
var router = express.Router();


// POST a new contact connection / make a friend request
/*
ON SUCCESS:
success: true
message: the human-readable message describing the success case, verifying, denying, or sending a new request 

ON FAILURE:
success: false
message: human-readable error message

Failure may also return 'input' containing the required fields that were not supplied
*/
router.post('/', (req, res) => {
    let username_a = req.body["username_a"];
    let username_b = req.body["username_b"];
    let accepted = req.body["accepted"];

    if (username_a && username_b && accepted != null) {

        // check to make sure both users exist
        db.one("SELECT MemberID FROM Members WHERE Username=$1", [username_a])
        .then( row1 => {
            db.one("SELECT MemberID FROM Members WHERE Username=$1", [username_b])
            .then( row2 => {
                console.log(row1);
                let memberID_a = row1["memberid"];
                let memberID_b = row2["memberid"];
                let params = [memberID_a, memberID_b];

                // first let's check if user B already sent user A a request
                db.oneOrNone("SELECT MemberID_A, MemberID_B, Verified FROM Contacts WHERE MemberID_A=$2 AND MemberID_B=$1", params)
                .then((row3) => {

                    // request accepted
                    if (row3 && accepted) {

                        // What luck, the other user already sent a request
                        db.none("UPDATE Contacts SET Verified=1 WHERE MemberID_A=$2 AND MemberID_B=$1", params).then(() => {
                            res.send({
                                success: true,
                                message: "contacts verified, friend request accepted"
                            });
                        });

                    // request denied
                    } else if(row3 && !accepted) {
                        db.none("UPDATE Contacts SET Verified=-1 WHERE MemberID_A=$2 AND MemberID_B=$1", params).then(() => {
                            res.send({
                                success: true,
                                message: "friend request rejected"
                            });
                        });
                    
                    // Create the new request
                    } else {
                        db.none("INSERT INTO Contacts(MemberID_A, MemberID_B) VALUES ($1, $2)", params)
                        .then(
                            res.send({
                                success: true,
                                message: "friend request sent"
                            })
                        )
                        .catch((err) => {
                            res.send({
                                success: false,
                                message: err
                            });
                        });
                    }
                });
            })

            // Member B does not exist
            .catch(err => {
                res.send({
                    success: false,
                    message: "the username you are requesting to connect with does not exist"
                })
            });
        })

        // Member A does not exist
        .catch(err => {
            res.send({
                success: false,
                message: "requesting user does not exist"
            })
        });  
    } else {
        res.send({
            success: false,
            input: req.body,
            error: "Missing required user information"
        });
    }
});


// GET a contact connection
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
router.get('/', (req, res) => {
    let username = req.param("username");

    if (username) {
        db.one("SELECT MemberID FROM Members WHERE Username=$1", [username])
        .then( members_row => {
            let userid = members_row["memberid"];
            db.any("SELECT MemberID_A, MemberID_B, Verified FROM Contacts WHERE (MemberID_A=$1 OR MemberID_B=$1) AND Verified=1", [userid])
            .then((verified_rows) => {
                db.any("SELECT MemberID_A, MemberID_B, Verified FROM Contacts WHERE (MemberID_A=$1 OR MemberID_B=$1) AND Verified=0", [userid])
                .then((pending_rows) => {
                    res.send({
                        success: true,
                        verified: verified_rows,
                        pending: pending_rows
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


// UPDATE a contact connection
// The Verified column is an int. 0 DEFAULT denotes an unconfirmed request, a 1 is confirmed, a -1 is declined
/*
ON SUCCESS:
success: true
verified: the new verified status
message: human-readable success case

ON FAILURE:
success: false
message: human-readable message
error: error trace

Failure may also return 'input' containing the required fields that were not supplied
*/
router.put('/', (req, res) => {
    let username_a = req.body["username_a"];
    let username_b = req.body["username_b"];
    let new_status = req.body["new_status"]

    if (username_a && username_b && new_status) {
        db.one("SELECT MemberID FROM Members WHERE Username=$1", [username_a])
        .then( un_a => {
            let userid_a = un_a["memberid"];
            db.one("SELECT MemberID FROM Members WHERE Username=$1", [username_b])
            .then( un_b => {
                let userid_b = un_b["memberid"];
                let params = [userid_a, userid_b, new_status];
                db.none("UPDATE Contacts SET Verified=$3 WHERE (MemberID_A=$1 AND MemberID_B=$2) OR (MemberID_A=$2 AND MemberID_B=$1)", params)
                .then(() => {
                    res.send({
                        success: true,
                        message: "status updated"
                    });
                })
                .catch((err) => {
                    res.send({
                        success:false,
                        error:err
                    });
                });
            })
            .catch((err) => {
                res.send({
                    success:false,
                    error:err
                })
            });
        })
        .catch((err) => {
            res.send({
                success:false,
                error:err
            })
        });
    } else {
        res.send({
            success: false,
            input: req.body,
            message: "Missing username"
        })
    }
});

module.exports = router;