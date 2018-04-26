//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();

const FormData = require("form-data");

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());
//We use this create the SHA256 hash
const crypto = require("crypto");
//pg-promise is a postgres library that uses javascript promises
const pgp = require('pg-promise')();
//We have to set ssl usage to true for Heroku to accept our connection
pgp.pg.defaults.ssl = true;

//Create connection to Heroku Database
let db;
//Uncomment next line and change the string to your DATABASE_URL
db = pgp('postgres://kqnectjlqliwgi:a2cd02769684b7fd4796b06330f182a0a770b0a6461e1403856a6ea7f51d2bee@ec2-174-129-41-64.compute-1.amazonaws.com:5432/d4g7n5qat2vqu5');

if(!db) {
    console.log("SHAME! Follow the intructions and set your DATABASE_URL correctly");
    process.exit(1);
}


/**
 * Method to get a salted hash.
 * We put this in its own method to keep consistency
 * @param {string} pw the password to hash
 * @param {string} salt the salt to use when hashing
 */
function getHash(pw, salt) {
    return crypto.createHash("sha256").update(pw + salt).digest("hex");
}


function sendEmail(from, to, subject, message) {
    let form = new FormData();
    form.append("from", from);
    form.append("to", to);
    form.append("subject", subject);
    form.append("message", message);
    form.submit("http://cssgate.insttech.washington.edu/~cfb3/mail.php", (err, res) => {
        if(err) console.error(err);
        console.log(res);
    });
}


//app.get('/users') means accept http 'GET' requests at path '/users'
app.post('/login', (req, res) => {
});


//app.post('/register') means accept http 'POST' requests at path "/release"
app.post("/register", (req, res) => {  
});

/*
 * Hello world functions below...
 */
app.get("/hello", (req, res) => {
    res.send({
        message: "Hello, you sent a GET request"
    });
});


app.post("/hello", (req, res) => {
    res.send({
        message: "Hello, you sent a POST request"
    });
});

app.get("/params", (req, res) => {
    res.send({
        //req.query is a reference to arguments in the url
        message: "Hello, " + req.query['name'] + "!"
    });
});

app.post("/params", (req, res) => {

    res.send({
        //req.query is a reference to arguments in the POST body
        message: "Hello, " + req.body['name'] + "! You sent a POST Request"
    });
});

app.get("/wait", (req, res) => {
    setTimeout(() => {
        res.send({
            message: "Thanks for waiting"
        });
    }, 1000);
});

app.post("/demosql", (req, res) => {
    var name = req.body['name'];

    if (name) {
        let params = [name];
        db.none("INSERT INTO DEMO(Text) VALUES ($1)", params)
        .then(() => {
            //We successfully added the name, let the user know
            res.send({
                success: true
            });
        }).catch((err) => {
            //log the error
            console.log(err);
            res.send({
                success: false,
                error: err
            });
        });
    } else {
        res.send({
            success: false,
            input: req.body,
            error: "Missing required information"
        });
    }
});

app.get("/demosql", (req, res) => {

    db.manyOrNone('SELECT Text FROM Demo')
    //If successful, run function passed into .then()
    .then((data) => {
        res.send({
            success: true,
            names: data
        });
    }).catch((error) => {
        console.log(error);
        res.send({
            success: false,
            error: error
        })
    });
});



/*
 * Return HTML for the / end point. 
 * This is a nice location to document your web service API
 * Create a web page in HTML/CSS and have this end point return it. 
 * Look up the node module 'fs' ex: require('fs');
 */
app.get("/", (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    for (i = 1; i < 7; i++) {
        //write a response to the client
        res.write('<h' + i + ' style="color:blue">Hello World!</h' + i + '>'); 
    }
    res.end(); //end the response
});

/* 
* Heroku will assign a port you can use via the 'PORT' environment variable
* To accesss an environment variable, use process.env.<ENV>
* If there isn't an environment variable, process.env.PORT will be null (or undefined)
* If a value is 'falsy', i.e. null or undefined, javascript will evaluate the rest of the 'or'
* In this case, we assign the port to be 5000 if the PORT variable isn't set
* You can consider 'let port = process.env.PORT || 5000' to be equivalent to:
* let port; = process.env.PORT;
* if(port == null) {port = 5000} 
*/ 
app.listen(process.env.PORT || 5000, () => {
    console.log("Server up and running on port: " + (process.env.PORT || 5000));
});