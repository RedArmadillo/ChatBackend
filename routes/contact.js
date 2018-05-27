const express = require('express');
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
let db = require('../utilities/utils').db;
let pushNoti = require('../utilities/push_noti.js').handleSingleToken;

var router = express.Router();

/*
Accept a new friend request. Joy.
*/
router.post('/:username_a/accept', (req, res) => {
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
            // TODO Check if exists before insert
            db.oneOrNone("SELECT MemberID_A, MemberID_B FROM Contacts WHERE (MemberID_A=$1 AND MemberID_B=$2) OR (MemberID_A=$2 AND MemberID_B=$1)", params)
            .then((exists) => {
                if (exists) {
                    res.send({
                        success: false,
                        message: "pending request already exists between these members"
                    })
                } else {
                    db.none("INSERT INTO Contacts(MemberID_A, MemberID_B) VALUES ($1, $2)", params)
                    .then(()=>{
                        db.one("select firebase_token from Members where memberid = $1", memberID_b)
                        .then(row => {
                            pushNoti(row.firebase_token, "You have new connection request from " + username_a + "!", username_a, "connection");
                            console.log("token of B: " + memberID_b);
                            res.send({
                                success: true,
                                message: "friend request sent"
                            })
                        });
                    });
                }
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

// GET a contact's connections
/*
ON SUCCESS:
success: true
verified: the list of verified connections returned by the database
outgoing: the list of outgoing connections returned by the database
incoming: the list of incoming connections returned by the database

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
            // db.any("SELECT MemberID_A, MemberID_B, Verified FROM Contacts WHERE (MemberID_A=$1 OR MemberID_B=$1) AND Verified=1", [userid])
            db.any(`SELECT m1.username AS username_a, m2.username AS username_b FROM contacts 
            LEFT JOIN members m1 ON contacts.memberid_a = m1.memberid 
            LEFT JOIN members m2 ON contacts.memberid_b = m2.memberid 
            WHERE (contacts.MemberID_A=$1 OR contacts.MemberID_B=$1) AND contacts.Verified=1`, [userid])
            
            .then((verified_rows) => {
                db.any(`SELECT m1.username AS username_a, m2.username AS username_b FROM contacts 
                LEFT JOIN members m1 ON contacts.memberid_a = m1.memberid 
                LEFT JOIN members m2 ON contacts.memberid_b = m2.memberid 
                WHERE contacts.MemberID_A=$1 AND contacts.Verified=0`, [userid])

                .then((outgoing_rows) => {
                    db.any(`
                    SELECT m1.username AS username_a, m2.username AS username_b FROM contacts 
                    LEFT JOIN members m1 ON contacts.memberid_a = m1.memberid 
                    LEFT JOIN members m2 ON contacts.memberid_b = m2.memberid 
                    WHERE contacts.MemberID_B=$1 AND contacts.Verified=0`, [userid])
                    .then((incoming_rows) => {
                        

                        res.send({
                            success: true,
                            verified: Array.from(getSetFromRes(verified_rows, username)),
                            outgoing: Array.from(getSetFromRes(outgoing_rows, username)),
                            incoming: Array.from(getSetFromRes(incoming_rows, username))
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


// GET a contact's verified connections
/*
ON SUCCESS:
success: true
verified: the list of verified connections returned by the database

ON FAILURE:
success: false
message: human-readable message
error: error trace
*/
router.get('/:username/verified', (req, res) => {
    let username = req.param("username");
    if (username) {
        db.one("SELECT MemberID FROM Members WHERE Username=$1", [username])
        .then( members_row => {
            let userid = members_row["memberid"];
            // db.any("SELECT MemberID_A, MemberID_B, Verified FROM Contacts WHERE (MemberID_A=$1 OR MemberID_B=$1) AND Verified=1", [userid])
            db.any(`SELECT m1.username AS username_a, m2.username AS username_b FROM contacts 
            LEFT JOIN members m1 ON contacts.memberid_a = m1.memberid 
            LEFT JOIN members m2 ON contacts.memberid_b = m2.memberid 
            WHERE (contacts.MemberID_A=$1 OR contacts.MemberID_B=$1) AND contacts.Verified=1`, [userid])
            
            .then((verified_rows) => {
                res.send({
                    success: true,
                    verified: Array.from(getSetFromRes(verified_rows, username)),
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


// GET a contact's verified connections
/*
ON SUCCESS:
success: true
outgoing: the list of verified connections returned by the database

ON FAILURE:
success: false
message: human-readable message
error: error trace
*/
router.get('/:username/outgoing', (req, res) => {
    let username = req.param("username");
    if (username) {
        db.one("SELECT MemberID FROM Members WHERE Username=$1", [username])
        .then( members_row => {
            let userid = members_row["memberid"];
            // db.any("SELECT MemberID_A, MemberID_B, Verified FROM Contacts WHERE (MemberID_A=$1 OR MemberID_B=$1) AND Verified=1", [userid])
            db.any(`SELECT m1.username AS username_a, m2.username AS username_b FROM contacts 
            LEFT JOIN members m1 ON contacts.memberid_a = m1.memberid 
            LEFT JOIN members m2 ON contacts.memberid_b = m2.memberid 
            WHERE contacts.MemberID_A=$1 AND contacts.Verified=0`, [userid])
            
            .then((outgoing_rows) => {
                res.send({
                    success: true,
                    outgoing: Array.from(getSetFromRes(outgoing_rows, username)),
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


// GET a contact's verified connections
/*
ON SUCCESS:
success: true
incoming: the list of verified connections returned by the database

ON FAILURE:
success: false
message: human-readable message
error: error trace
*/
router.get('/:username/incoming', (req, res) => {
    let username = req.param("username");
    if (username) {
        db.one("SELECT MemberID FROM Members WHERE Username=$1", [username])
        .then( members_row => {
            let userid = members_row["memberid"];
            // db.any("SELECT MemberID_A, MemberID_B, Verified FROM Contacts WHERE (MemberID_A=$1 OR MemberID_B=$1) AND Verified=1", [userid])
            db.any(`SELECT m1.username AS username_a, m2.username AS username_b FROM contacts 
            LEFT JOIN members m1 ON contacts.memberid_a = m1.memberid 
            LEFT JOIN members m2 ON contacts.memberid_b = m2.memberid 
            WHERE contacts.MemberID_B=$1 AND contacts.Verified=0`, [userid])
            
            .then((incoming_rows) => {
                res.send({
                    success: true,
                    incoming: Array.from(getSetFromRes(incoming_rows, username)),
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

function getSetFromRes(l, username) {
    // we will get list l in format [{username_a:una, username_b:unb}, {...}, ...]
    let s = new Set();
    for (i = 0; i < l.length; i++) {
        let entry = l[i];
        for (var key in entry) {
            // skip loop if the property is from prototype
            if (!entry.hasOwnProperty(key)) continue;
            var obj = entry[key];
            if (obj != username) {                
                s.add(obj);
            }
        }
    }
    return s;
}

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
router.post('/:username_a/remove', (req, res) => {
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

            db.none("UPDATE Contacts SET Verified=-1 WHERE (MemberID_A=$2 AND MemberID_B=$1) OR (MemberID_A=$1 AND MemberID_B=$2)", params)
            .then( () => {
                res.send({
                    success: true,
                    message: "contact removed",
                });
            })
            .catch( (err) => {
                res.send({
                    success: false,
                    message: "could not remove contact",
                    error: err
                });
            });
        })
    }
});

module.exports = router;

/*

{
    "success": true,
    "data": [
        "user1": {
            "username": "hi"
        },
        "user2": {
            "username": "testuser"
        },
    ] 
}
// at 0
"user1": {
    "username": "hi"
}