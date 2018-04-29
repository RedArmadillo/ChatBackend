const pgp = require('pg-promise')();
//We have to set ssl usage to true for Heroku to accept our connection
pgp.pg.defaults.ssl = true;
//Create connection to Heroku Database
const db = pgp('postgres://batgfyugzdiczi:89ca471954219235ad09d7bf9b1040d31dc320026c896c9454417af8796c75fe@ec2-54-235-109-37.compute-1.amazonaws.com:5432/df6c3hq563a0k5');

module.exports = db;