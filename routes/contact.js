/*
DROP TABLE IF EXISTS Contacts;
CREATE TABLE Contacts(PrimaryKey SERIAL PRIMARY KEY,
                      MemberID_A INT NOT NULL,
                      MemberID_B INT NOT NULL,
                      Verified INT DEFAULT 0,
                      FOREIGN KEY(MemberID_A) REFERENCES Members(MemberID),
                      FOREIGN KEY(MemberID_B) REFERENCES Members(MemberID)
);
*/

const express = require('express');
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
let db = require('../utilities/utils').db;
var router = express.Router();


// POST a new contact connection / make a friend request
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
                let memberID_a = row1["MemberID"];
                let memberID_b = row2["MemberID"];
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
    }
});


// GET a contact connection
router.get('/', (req, res) => {

});


// UPDATE a contact connection
// The Verified column is an int. 0 DEFAULT denotes an unconfirmed request, a 1 is confirmed, a -1 is declined
router.put('/', (req, res) => {

});

module.exports = router;