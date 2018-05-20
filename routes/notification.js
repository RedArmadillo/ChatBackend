const express = require('express');
const bodyParser = require("body-parser");

let db = require('../utilities/utils').db;

var router = express.Router();

router.use(bodyParser.json());

var request = require('request');
 



var fullBody = new Object();
var key1 = "to";
var key2 = "collapse_key";
var value2 = "type_a";
var key3 = "notification";
var value3 = {
    body : "You have new message(s)",
    title: "Red Armadillo"
};
fullBody[key1] = "cB6ZIJhFMG0:APA91bGjSGs0EAT5f55ydtZBrAwM814mGOtI7ccsnIY43bxmOHNJQO5yeUQosND121cF7qskWjQeeE50386HamU3lQ7JFtuH2Om9Ms1DFjrejIrle8c8nt0eAwtzKbgyA7fFn5tMIapN";
fullBody[key2] = value2;
fullBody[key3] = value3;

console.log(process.env);
var options = {
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



module.exports = router;
