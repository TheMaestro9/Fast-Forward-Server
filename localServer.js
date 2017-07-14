/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 // First add the obligatory web framework
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var url = require ('url'); 
app.use(bodyParser.urlencoded({
  extended: false
}));

// Util is handy to have around, so thats why that's here.
const util = require('util')
// and so is assert
const assert = require('assert');

// We want to extract the port to publish our app on
var port = process.env.PORT || 8080;

// Then we'll pull in the database client library
var mysql = require('mysql');

// this is the local data base initalizatioin : 
var conn = mysql.createConnection({
  host: "localhost", 
  port: "3306", 
  user: "Walid Moussa", 
  password: "wal2191995",
  database: "testos"
});

conn.connect(function (err){
  if (err) throw err ;
  console.log("connected"); 
  conn.query("describe wello", function (err, result) {
    if (err) throw err;
    console.log(result);
  });

});



app.get("/comm", function(request, response) {

    // execute a query on our database
    // connection.query('SELECT * FROM words ORDER BY word ASC', function (err, result) {
    //   if (err) {
    //     console.log(err);
    //    response.status(500).send(err);
    //   } else {
    //     console.log(result);
    //    response.send(result);
    //   }

    // });
    var toSend = {"msg": "testing", "to": "berlenty", "from":"walid"};

    console.log(toSend); 
    response.send (toSend) ; 
  // response.send ("hello mother fater"); 
});

app.get("/echo", function(request, response) {

    // execute a query on our database
    // connection.query('SELECT * FROM words ORDER BY word ASC', function (err, result) {
    //   if (err) {
    //     console.log(err);
    //    response.status(500).send(err);
    //   } else {
    //     console.log(result);
    //    response.send(result);
    //   }

    // });
    var toSend = url.parse(request.url, true).query;
    //var toSend = {"msg": "testing", "to": "berlenty", "from":"walid"};

    console.log(toSend); 
    response.send (toSend) ; 
  // response.send ("hello mother fater"); 
});

// Now we go and listen for a connection.
app.listen(port);

require("cf-deployment-tracker-client").track();
