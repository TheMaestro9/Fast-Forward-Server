var express = require('express');
var fs =require('fs'); 
var app = express();
var bodyParser = require('body-parser');
var url = require ('url'); 
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json()) ;
var opn = require ("opn") ; 
var OpenUrl =  require("openurl") ; 
var sendReq  = require ('request') ;
var unirest = require("unirest"); 
// Util is handy to have around, so thats why that's here.
const util = require('util')
// and so is assert
const assert = require('assert');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
// We want to extract the port to publish our app on
var port = process.env.PORT || 8080;

// Then we'll pull in the database client library
var mysql = require('mysql');////////////////////

// this is the local data base initalizatioin : 
var db_config = {
  host: "127.0.0.1", 
  port: "3306", 
  user: "Walid Moussa", 
  password: "w2191995",
  database: "FFDB"
} ; 
//var connection = mysql.createConnection();
var connection ; 

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }
    else 
      console.log("connected")                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();



app.get("/words", function(request, response) {

    // execute a query on our database
    connection.query('SELECT * FROM words ORDER BY word ASC', function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
        console.log(result);
       response.send(result);
      }

    });

});



app.post("/accepted-simulation", function(request, response) {
  
  var userId = request.body.user_id ;  
  var currentDate  = new Date().toISOString().replace("T", " ").replace("Z", "");
  currentDate = JSON.stringify(currentDate) ; 
  var qstring = "select * from applications , simulation_date where user_id = "+userId+" and status = \"accepted\" " +
  " and simulation_date.simulation_date_id = applications.simulation_date_id and"+
  " date >" + currentDate ;  
  console.log("the query: "+qstring +"\n"); 
  connection.query(qstring , function (err, result) {
    if (err) {
      console.log(err);
     response.status(500).send(err);
    } else {
        response.send(result) ; 
      }

    });
 
});

app.listen(port);
