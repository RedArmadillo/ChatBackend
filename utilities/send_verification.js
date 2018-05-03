let nodemailer = require("nodemailer");
let db = require('../utilities/utils').db;

function verify_account (username, email, secret) {

    verify_params = [username, secret];
    db.none("INSERT INTO Verification(Username, Secret) VALUES ($1, $2)", verify_params)
    .catch(err => {console.log(err)})

    let smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.VERIFICATION_USER,
            pass: process.env.VERIFICATION_PASS
        }
    });

    let mailOptions = {
        from: "Team 7 <no-reply@gmail.com>",
        to: username + " <" + email + ">",
        subject: "Please verify your RedArmadillo account",
        text: "This email is to inform you that you have succesfully registered for RedArmadillo chat service. If this email was sent in error, please ignore it.\
To verify this account, visit " + utils.base_url + "verify/" + secret 
    }

    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + response.message);
        }
    });

}

module.exports = verify_account;