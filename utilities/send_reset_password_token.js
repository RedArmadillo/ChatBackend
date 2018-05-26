let nodemailer = require("nodemailer");
let db = require('../utilities/utils').db;
let base_url = require('../utilities/utils').base_url;

function send_token (username, email, secret) {
    verify_params = [email, secret];
    db.none("UPDATE Members SET Token=$2 WHERE Email=$1", verify_params)
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
        subject: "Your RedArmadillo reset password token",
        text: "Your token is: " + secret 
    }

    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + response.message);
        }
    });
}

module.exports = send_token;