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
var mysql = require('mysql');////////////////////

// this is the local data base initalizatioin : 
var connection = mysql.createConnection({
  host: "127.0.0.1", 
  port: "3306", 
  user: "Walid Moussa", 
  password: "wal2191995",
  database: "FFDB"
});

connection.connect(function (err){
  if (err) throw err ;
  console.log("connected"); 
  // connection.query("CREATE TABLE abolo (name VARCHAR(20) , den INT )", function (err, result) {
  //   if (err) {
  //     console.log(err); 
  //   }
  //   console.log(result);
  // });

});

app.get("/respo", function(request, response) {
     var toSend = "" ;
     var ww = "Select * from user;" ; 
    connection.query(ww,function (err, result) {
    if (err) {
      console.log(err); 
      response.status(500).send(err);
    }
    
    response.send(result); 
    // console.log("data recived from data base is:") ;
    // ///response.json(result);  
    // console.log(result);
    //  response.send (result) ; 
    // toSend = result ; 
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
   // var toSend = url.parse(request.url, true).query;
    //var toSend = {"msg": "testing", "to": "berlenty", "from":"walid"};

   // console.log(toSend); 
   // response.send (toSend) ; 
  // response.send ("hello mother fater"); 
});

app.get("/login", function(request, response) {

    var UserName = request.query.user_name ; 
    var password = request.query.password ; 
    var toSend = {
      result : false 
    } ; 

   
    // execute a query on our database
    var qstring = "select * from user where user_name ='"+UserName+"' and password='"+password +"'"; 
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
          toSend.result = true ; 
          response.send(toSend);
        }
      }

    });
});

app.get("/test", function(request, response) {
    
    var date = request.query.date ; 

    console.log(date); 

    response.send (date ) ; 

  
});

app.get("/register", function(request, response) {

    var UserName = request.query.user_name ; 
    var password = request.query.password ; 
    var degree = request.query.degree ; 
    var user_email = request.query.user_email ; 
    var school = request.query.school ; 
    var phone_no = request.query.phone_no ;

    var toSend = {} ; 
    // execute a query on our database
    var qstring = "INSERT INTO USER ( user_name, password , degree , user_email , school , phone_no ) VALUES('"
                  +UserName+"','"+password +"','" +degree+"','"+user_email +"','" +school+"','"+phone_no +"');"; 
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
        response.send(result) ;
        // if (result.affectedRows === 0)
        // {
        //  response.send(toSend); 
        // }
        // else {
        //   response.send(result);
        // }
      }

    });
});

app.get("/allVideos", function(request, response) {

    var UserID = request.query.user_id ;  
    var toSend = {
      "result" : false  
    } ; 
    var videoArr = [ ] ; 
    console.log ( videoArr); 
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
              
          toSend  = videoArr ; 
         
         console.log(toSend); 
         // console.log(JSON.stringify(toSend)); 
          response.send (toSend);  
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

function checkSimExist (companyID, fieldID , name ,price , callback) 
{
     var qstring ="select simulation_id from simulation where "+
                 "company_id ="+companyID+" and field_id = " +fieldID+ " and simulation_name = '"+ name+"' and price= "+ price+ ";" ; 
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       //response.status(500).send(err);
      } else {
       callback(result) ; 
      }

    });
} 

function insertSimDate ( date , simID ){
    // first check that the date doesn't exist before. 
    checkSimDateExist (date , simID , function (simDateID){
        if (simDateID.length=== 0 ) // if it don't exist insert it 
        {
              var qstring = "INSERT INTO simulation_date ( simulation_id  , date , votes )" + 
                              "VALUES (" +simID+ " , '"+date+"', 0);" ;   
              console.log("the query: "+qstring +"\n"); 
              connection.query(qstring , function (err, result) {
                if (err) {
                  console.log(err);
                //response.status(500).send(err);
              }
              else 
                console.log("date inserted successfully"); 
              });                 
            
        }

      else {

        console.log("date already exist")
      }
    }); 
     
}

function checkSimDateExist ( date , simID , callback){

var qstring ="select simulation_date_id from simulation_date where "+
                 "simulation_id ="+simID+" and date = '"+date+"';" ; 
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       //response.status(500).send(err);
      } else {
       callback(result) ; 
      }

    });

}
app.get ("/add-simulation" ,  function(request, response) {
    
    var companyID = request.query.company_id ;
    var fieldID  = request.query.field_id ;
    var name = request.query.simulation_name ;
    var price = request.query.price ;
    var date = request.query.date ; 


    checkSimExist(companyID, fieldID, name , price , function (simID) {
        if (simID.length != 0 )
          {
            insertSimDate ( date , simID[0].simulation_id);
          } 
        else 
        {
           var qstring = "INSERT INTO simulation ( simulation_name , company_id  ,  field_id , price )" + 
                  "VALUES ( '"+name+"'," +companyID+ ","+ fieldID+" , "+ price+ ");" ;   
            console.log("the query: "+qstring +"\n"); 
            connection.query(qstring , function (err, result) {
              if (err) {
                console.log(err);
              response.status(500).send(err);
              } else {
                //response.send(result) ; 
              }

           });

              checkSimExist(companyID, fieldID, name , price , function (simID) {
              insertSimDate ( date , simID[0].simulation_id);
          }); 
        }
    });
   response.send("done"); 
});

// Now we go and listen for a connectionection.
app.listen(port);

require("cf-deployment-tracker-client").track();
