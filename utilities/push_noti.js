let db = require('../utilities/utils').db;
var request = require('request');


function push_notification(rows, msg, thesender, thetag) {
    let forwardedMsg = msg;
    let sender = thesender;
    let tag = thetag;
    for (var i in rows) {
        if (rows[i].firebase_token != null) {
            handleSingleToken(rows[i].firebase_token, forwardedMsg, sender, tag);
        }
    }
}

function handleSingleToken(token, message, sender, thetag) {
    let fullBody = new Object();
    let key1 = "to";
    let key2 = "collapse_key";
    let value2 = "type_a";
    let key3 = "notification";
    let value3 = {
        body : message,
        title: sender,
        icon : "ic_chat",
        tag : thetag,
        sound: "default"
    };

    // Passing the argument token here
    fullBody[key1] = token;
    fullBody[key2] = value2;
    fullBody[key3] = value3;
    
    // The options of POST request 
    let options = {
        url: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        body: JSON.stringify(fullBody),
        headers: {
        'Authorization' : 'key=AAAABwN1kqU:APA91bG8YPbMWrNfuZVIRyB1Wuy93gaTYiERpwKWydlnSBqBfhlWznL03RCDCOXVbXdAANqg9H0DY7Mxc9ZtHKRbx3WpaTJegacCsm_j7EhWaKTJl1khyLu9tF5-Kw_Xc6b34SY6ROtt',
        // 'Authorization' : process.env.FIREBASE_SERVER_KEY,
        'Content-Type' : 'application/json',
        }
    };
    request(options, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body)
    });
}

function push_notification_topic(rows, msg, thesender, thetag) {
    let forwardedMsg = msg;
    let sender = thesender;
    let tag = thetag;
    for (var i in rows) {
        if (rows[i].username != null) {
            handleSingleTopic(rows[i].username, forwardedMsg, sender, tag);
        }
    }
}

function handleSingleTopic(topic, message, sender, thetag) {
    let fullBody = new Object();
    let key1 = "to";
    let key2 = "collapse_key";
    let value2 = "type_a";
    let key3 = "notification";
    let value3 = {
        body : message,
        title: sender,
        icon : "ic_chat",
        tag : thetag,
        sound: "default"
    };

    // Passing the argument token here
    fullBody[key1] = topic;
    fullBody[key2] = value2;
    fullBody[key3] = value3;
    
    // The options of POST request 
    let options = {
        url: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        body: JSON.stringify(fullBody),
        headers: {
        'Authorization' : 'key=AAAABwN1kqU:APA91bG8YPbMWrNfuZVIRyB1Wuy93gaTYiERpwKWydlnSBqBfhlWznL03RCDCOXVbXdAANqg9H0DY7Mxc9ZtHKRbx3WpaTJegacCsm_j7EhWaKTJl1khyLu9tF5-Kw_Xc6b34SY6ROtt',
        // 'Authorization' : process.env.FIREBASE_SERVER_KEY,
        'Content-Type' : 'application/json',
        }
    };
    request(options, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body)
    });
}



module.exports = {push_notification, handleSingleToken, push_notification_topic, handleSingleTopic};