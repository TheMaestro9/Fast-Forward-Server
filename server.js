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
/*
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
*/
var cors = require('cors');

app.use(cors())  ;
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

// Now lets get cfenv and ask it to parse the environment variable
var cfenv = require('cfenv');
var appenv = cfenv.getAppEnv();

//Within the application environment (appenv) there's a services object

var services = appenv.services;

// The services object is a map named by service so we extract the one for PostgreSQL
var mysql_services = services["compose-for-mysql"];

// This check ensures there is a services for MySQL databases
assert(!util.isUndefined(mysql_services), "Must be bound to compose-for-mysql services");

// We now take the first bound MongoDB service and extract it's credentials object
var credentials = mysql_services[0].credentials;

var connectionString = credentials.uri;

// set up a new connection using our config details
var connection = mysql.createConnection(credentials.uri);

connection.connect(function(err) {
  if (err) {
   console.log(err);
  } else {
    connection.query('CREATE TABLE words (id int auto_increment primary key, word varchar(256) NOT NULL, definition varchar(256) NOT NULL)', function (err,result){
      if (err) {
        console.log(err)
      }
    });
  }
});

// We can now set up our web server. First up we set it to serve static pages
app.use(express.static(__dirname + '/public'));

app.put("/words", function(request, response) {

      var queryText = 'INSERT INTO words(word,definition) VALUES(?, ?)';

      connection.query(queryText, [request.body.word,request.body.definition], function (error,result){
        if (error) {
          console.log(error);
          response.status(500).send(error);
        } else {
          console.log(result);
          response.send(result);
        }
      });

});

// Read from the database when someone visits /hello
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


app.get("/query", function(request, response) {

    // execute a query on our database
    var qstring = request.query.q ; 
    console.log(qstring); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
        console.log(result);
       response.send(result);
      }

    });
});



app.get("/login", function(request, response) {

    var UserName = request.query.user_name ; 
    var password = request.query.password ; 
    var toSend = {
      "result" : false  
    } ; 
    // execute a query on our database
    var qstring = "select user_name , user_id from user where user_name ='"+UserName+"' and password='"+password +"'"; 
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
        if (result.length === 0)
        {
         response.send(toSend); 
        }
        else {
          toSend.result= true ;
          toSend  = Object.assign(toSend , result[0]) ;
          response.send (toSend);  
        }
      }

    });
});


app.get("/allVideos", function(request, response) {

    var UserID = request.query.user_id ;  
    var toSend = {
      "result" : false  
    } ; 
    var videoArr = [] ; 
    // execute a query on our database
    var qstring = "select * from company_video;" ;  
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
        if (result.length === 0)
        {
         response.send(toSend); 
        }
        else {
          toSend.result= true ;
          for (i = 0 ; i < result.length ; i ++)
              videoArr.push(result[i]); 
          response.send (videoArr);  
        }
      }

    });
});

app.get("/company_details", function(request, response) {

    var companyID = request.query.company_id ;  
    var toSend = {} ; 
    // execute a query on our database
    var qstring = "select * from company where company_id ="+companyID +";" ;  
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          qstring= "select COUNT(*) from user_follow_company   WHERE company_id =" +companyID +";" ;  
              connection.query(qstring , function (err, result2) {
                if (err) {
                  console.log(err);
                response.status(500).send(err);
                } else {
                    console.log(result2[0]["COUNT(*)"]); 
                    toSend["followers"] =result2[0]["COUNT(*)"] ; 
                    toSend = Object.assign (result[0] , toSend); 
                    response.send (toSend);  
                }

            });
      }
    });

    console.log(toSend)
});

app.get("/get_company_simulations", function(request, response) {
    
    var companyID = request.query.company_id ;
    var qstring = "select * from simulation_date , simulation where company_id=" +companyID +
                  " and simulation_date.simulation_id = simulation.simulation_id;" ;  
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

// this is the local data base initalizatioin : 

/*
conn.connect(function (err){
  if (err) throw err ;
  console.log("connected"); 
  con.query("CREATE DATABASE mydb", function (err, result) {
    if (err) throw err;
    console.log("Database created");
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
*/
app.listen(port);

require("cf-deployment-tracker-client").track();
