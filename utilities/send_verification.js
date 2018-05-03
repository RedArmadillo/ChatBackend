let nodemailer = require("nodemailer");

function verify_account (username, email) {

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
        text: "This email is to inform you that you have succesfully registered for RedArmadillo\
        chat service. If this email was sent in error, please ignore it."
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