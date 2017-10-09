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
//var sendReq  = require ('request') ;
 var sendReq = require("request");
 var unirest = require("unirest"); 


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
app.use(bodyParser.json()) ;

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

app.get("/willims", function(request, response) {
    
    var dataos = request.query.dataos ; 
    var qstring = "INSERT INTO Garbage VALUES('"+data+"');";  
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

app.get("/check-connection", function(request, response) {
    
    toSend = {
      "msg": "hello"
    }
    response.send(toSend); 
   
});

app.get("/edit-user", function(request, response) {
    
    
        //console.log(request.query); 
   // response.send(request); 
  // response.send(request.query); 
    var userID = request.query.user_id;
    var userName = request.query.user_name ; 
    var password = request.query.password ; 
    var degree = request.query.degree ; 
    var user_email = request.query.user_email ; 
    var school = request.query.school ; 
    var phone_no = request.query.phone_no ;
    var birthDate = request.query.birth_date ; 


     var toSend = {
        "result" : false , 
      //  "name": "",
        "msg" : ""}
    var qstring = "UPDATE  user SET user_name ='"+ userName+ 
                                   "', degree = '"+degree+
                                   "', user_email='"+user_email+ 
                                   "', school ='"+school+
                                   "', phone_no='"+phone_no+
                                   "', password='"+password+
                                   "', birth_date='"+birthDate+
                                   "' where user_id ="+userID;  
    console.log("the query: "+qstring +"\n"); 
     connection.query(qstring , function (err, result) {
                  if (err) {
                    console.log(err.message); 
                    if (err.message.match("phone") && err.message.match("Duplicate")){
                      toSend.msg = "this phone number already exist"; 
                      response.send(toSend); 
                    }
                   else if (err.message.match("user_email") && err.message.match("Duplicate")){
                       toSend.msg = "this email already exist"; 
                      response.send(toSend); 
                    }
                    else 
                      response.send(err); 
                    
                } else {
                  toSend.result = true ; 
                 // toSend.name= UserName ; 
                  response.send(toSend) ;
                }

        
    });
   
});

app.get("/check-version", function(request, response) {

    var version = request.query.version ; 
     var vcheck = require("./page_modules/versionCheck") ; 

    vcheck.CheckVersion(connection , version , response) ; 
    // var toSend = {
    //   "result" : false 
    // }
    // str = "select * from appDetails where appKey = 'version' " ; 
    //  connection.query(str , function (err, result) {
    //   if (err) {
    //     console.log(err);
    //    response.status(500).send(err);
    //   } else {
    //       console.log(result) ; 
    //       console.log(result[0].appValue) ; 
    //       var NeededVersion = parseInt(result[0].appValue) ; 
    //       console.log(NeededVersion);
    //       if ( version > NeededVersion ){
    //       toSend.result = true ; 
    //       response.send(toSend);
    //       }
    //         else
    //          response.send(toSend); 
    //     }

    // });
    
});

app.post("/accept-applicant", function(request, response) {

    var price = request.body.price ; 
    var userID =   request.body.user_id ; 
    var simDateId =  request.body.simulation_date_id ; 


    var stat = ""  ; 
    if (price === 0)
      stat = "accepted" ; 
    else
      stat = "pending payment"; 

      str = "update applications set status = '"+stat+"' where user_id ="+userID+" and simulation_date_id = "+simDateId ; 
    console.log(str); 
     connection.query(str , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          
          response.send(result);
          }
           
    });
    
});


app.post("/reject-applicant", function(request, response) {

    var price = request.body.price ; 
    var userID =   request.body.user_id ; 
    var simDateId =  request.body.simulation_date_id ; 


    var stat = "rejected"  ; 
      
      str = "update applications set status = '"+stat+"' where user_id ="+userID+" and simulation_date_id = "+simDateId ; 
    console.log(str); 
     connection.query(str , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          
          response.send(result);
          }
           
    });
    
});
app.get("/update-dead-line", function(request, response) {

    var deadLine = request.query.dead_line ; 
    var toSend = {
      "result" : false 
    }
    str = "update appDetails set appValue = '"+deadLine+"' where appKey = 'dead_line' " ; 
    console.log(str); 
     connection.query(str , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          
          response.send(result);
          }
           
    });
    
});
app.get("/update-version", function(request, response) {

    var version = request.query.version ; 
    
    str = "update appDetails set appValue = '"+version+"' where appKey = 'version' " ; 
    console.log(str); 
     connection.query(str , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          
          response.send(result);
          }
           
    });
    
});
app.post("/edit-user", function(request, response) {
    
        //console.log(request.query); 
   // response.send(request); 
  // response.send(request.query); 
    var userID = request.body.user_id;
    var userName = request.body.user_name ; 
    var degree = request.body.degree ; 
    var user_email = request.body.user_email ; 
    var school = request.body.school ; 
    var phone_no = request.body.phone_no ;

      var profileServer = require ("./page_modules/profileServer") 
    profileServer.EditUser(connection , response , UserName 
    , degree ,user_email , school , phone_no , userID  ); 
   
});
app.get("/query", function(request, response) {

    // execute a query on our database
    var qstring = request.query.q ; 
    console.log(qstring); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
        if(err.code==="PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR"){
          var currentTime = Date (); 
          InsertGarbage ("we have a problem") ; 
          InsertGarbage(err.code + currentTime ); 
          connection.connect(function(err) {
              if (err) {
                console.log(err);
              } 
              else {
                InsertGarbage("Error Fixed" + currentTime);
              }
           });

        }
       response.status(500).send(err);
      } else {
        console.log(result);
       response.send(result);
      }

    });
});

// login and registeration 

app.get("/login", function(request, response) {

    var UserEmail = request.query.user_email ; 
    var password = request.query.password ; 
   
   var loginServer = require ("./page_modules/loginServer") 
    loginServer.Login(connection , response , UserEmail, password  ); 
});

app.get("/login-fb", function(request, response) {

    var UserEmail = request.query.user_email ;
    var toSend = {
      "result" : false  
    } ; 
    // execute a query on our database
    var qstring = "select user_name , user_id , company_or_not from user where user_email ='"+UserEmail+"'"; 
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

function insertUserPormoCode (ID , promo){

  var qstring ="insert into user_promo_code values ("+ID+",'"+promo+"')" ;   
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       //response.status(500).send(err);
      } else {
        console.log("ok") ; 
      }

    });
}

// app.get("/register2", function(request, response) {

//     var UserName = request.query.user_name ; 
//     var password = request.query.password ; 
//     var degree = request.query.degree ; 
//     var user_email = request.query.user_email ; 
//     var school = request.query.school ; 
//     var birthDate = request.query.birth_date ; 
//     var phone_no = request.query.phone_no ;
//     var promoCode = request.query.promo_code ; 
//     var toSend = {
//         "result" : false , 
//         "msg" : ""}
   
   
//           // execute a query on our database
//                var qstring = "INSERT INTO user ( user_name, password, birth_date, degree ,rating , user_email , school , phone_no  , user_image_link ) VALUES('"
//                               +UserName+"','"+password +"','"+birthDate+"','" +degree+"',-1,'"+user_email +"','" +school+"','"+phone_no +
//                               "' , 'http://www.fastforwardsim.com/alpha/male.png');"; 
//                 console.log("the query: "+qstring +"\n"); 
//                 connection.query(qstring , function (err, result) {
//                   if (err) {
//                     console.log(err.message); 
//                     if (err.message.match("phone") && err.message.match("Duplicate")){
//                       toSend.msg = "this phone number already exist"; 
//                       response.send(toSend); 
//                     }
//                    else if (err.message.match("user_email") && err.message.match("Duplicate")){
//                        toSend.msg = "this email already exist"; 
//                       response.send(toSend); 
//                     }
//                     else 
//                       response.send(err); 
                    
//                 } else {
//                   getUserID(user_email , function(UID){
//                       toSend.result = true ; 
//                       toSend["user_id"] = UID[0].user_id ; 
//                       insertUserPormoCode(UID[0].user_id , promoCode); 
//                       response.send(toSend) ;
//                   });
                  
//                 }

        
//     });
        
// });


function insertInterests (userID , interests){
  for ( i = 0 ; i < interests.length ; i ++ ){

      
    qstring = "insert into user_interests values ("+userID+",'"+interests[i]+"')" ; 
    console.log(qstring); 
    connection.query(qstring , function (err, result) {
      
    });
  }

}

// function insertExpo (userID){

      
//     qstring = "insert into user_attending_expo values ("+userID+")" ; 
//     console.log(qstring); 
//     connection.query(qstring , function (err, result) {
      
//     });
  

// }
app.post("/register3", function(request, response) {

    var UserName = request.body.user_name ; 
    var password = request.body.password ; 
    var degree = request.body.degree ; 
    var user_email = request.body.user_email ; 
    var school = request.body.school ; 
    var birthDate = request.body.birth_date ; 
    var phone_no = request.body.phone_no ;
    var promoCode = request.body.promo_code ; 
    //promoCode = "William is the Best"; 
    // if(pormoCode === "earlybird") 
    //   promoCode = "" ;
    var interests = request.body.interests ; 
    var major =  request.body.major ; 

    var expo  =request.body.expo  ; 


    var RegisterationDate = new Date ().toISOString().replace("T"," ").replace("Z","") ; 
    var toSend = {
        "result" : false , 
        "msg" : ""}
      //  birthDate = birthDate.replace("T",  " "); 
      //  birthDate = birthDate.replace("Z",  " "); 

        //  var bd = new Date (birthDate); 
          // execute a query on our database
               var qstring = "INSERT INTO user ( user_name, password, birth_date,major, degree ,rating,  user_email , school , phone_no,  registeration_date, user_image_link ) VALUES('"
                              +UserName+"','"+password +"','"+birthDate+"','"+major+"','" +degree+"', -1, '"+user_email +"','" +school+"','"+phone_no +"','"+ RegisterationDate+
                              "' , 'https://www.google.com.eg/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=0ahUKEwiLsYnUuqfVAhXGwxQKHYG3BMYQjRwIBw&url=http%3A%2F%2Fwww.fhcomplete.org%2F&psig=AFQjCNFsSLOl90IWV2MSZqgQgprT4cheJw&ust=1501175940834869');"; 
                console.log("the query: "+qstring +"\n"); 
                connection.query(qstring , function (err, result) {
                  if (err) {
                    console.log(err.message); 
                    if (err.message.match("phone") && err.message.match("Duplicate")){
                      toSend.msg = "this phone number already exist"; 
                      response.send(toSend); 
                    }
                   else if (err.message.match("user_email") && err.message.match("Duplicate")){
                       toSend.msg = "this email already exist"; 
                      response.send(toSend); 
                    }
                    else 
                      response.send(err); 
                    
                } else {
                  getUserID(user_email , function(UID){
                      toSend.result = true ; 
                      insertInterests(UID[0].user_id , interests) ; 
                      toSend["user_id"] = UID[0].user_id ; 
                      insertUserPormoCode(UID[0].user_id , promoCode); 

                      // if(typeof expo!= "undefined"){
                      //       if(expo ===true)
                      //         insertExpo(UID[0].user_id) ; 
                      // }
                      response.send(toSend) ;
                  });
                  
                }

        
    });
        
});
app.post("/register2", function(request, response) {

    var UserName = request.body.user_name ; 
    var password = request.body.password ; 
    var degree = request.body.degree ; 
    var user_email = request.body.user_email ; 
    var school = request.body.school ; 
    var age = request.body.age ; 
    var phone_no = request.body.phone_no ;
    var promoCode = request.body.promo_code ; 
    var interests = request.body.interests ;
    var expo = request.body.expo ; 
  //  promoCode = "William is the Best" ; 
    // if(pormoCode === "earlybird") 
    //   promoCode = "" ; 
    var birthDateYear = 2017-age ;  

    var birthDate = birthDateYear+"-2-1 00:00:00" ; 

    var bd = new Date (birthDate)

    var RegisterationDate = new Date ().toISOString().replace("T"," ").replace("Z","") ; 

    //var bd = new Date (birthDate); 
    var toSend = {
        "result" : false , 
        "msg" : ""}
   
   
          // execute a query on our database
             var qstring = "INSERT INTO user ( user_name, password, birth_date,major, degree ,rating,  user_email , school , phone_no,  registeration_date, user_image_link ) VALUES('"
                              +UserName+"','"+password +"','"+birthDate+"','"+major+"','" +degree+"', -1, '"+user_email +"','" +school+"','"+phone_no +"','"+ RegisterationDate+
                              "' , 'https://www.google.com.eg/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=0ahUKEwiLsYnUuqfVAhXGwxQKHYG3BMYQjRwIBw&url=http%3A%2F%2Fwww.fhcomplete.org%2F&psig=AFQjCNFsSLOl90IWV2MSZqgQgprT4cheJw&ust=1501175940834869');"; 
               console.log("the query: "+qstring +"\n"); 
                connection.query(qstring , function (err, result) {
                  if (err) {
                    console.log(err.message); 
                    if (err.message.match("phone") && err.message.match("Duplicate")){
                      toSend.msg = "this phone number already exist"; 
                      response.send(toSend); 
                    }
                   else if (err.message.match("user_email") && err.message.match("Duplicate")){
                       toSend.msg = "this email already exist"; 
                      response.send(toSend); 
                    }
                    else{ 
                     // response.send(err); 
                   //  toSend.msg = "fuck you "; 
                      response.send(toSend); 
                    }
                } else {
                  getUserID(user_email , function(UID){
                      toSend.result = true ; 
                      insertInterests(UID[0].user_id , interests) ; 
                      toSend["user_id"] = UID[0].user_id ; 
                      insertUserPormoCode(UID[0].user_id , promoCode); 
                      //   if(typeof expo!= "undefined"){
                      //       if(expo ===true)
                      //         insertExpo(UID[0].user_id) ; 
                      // }
                      response.send(toSend) ;
                  });
                  
                }

        
    });
        
});
app.get("/get-ticket-price", function(request, response) {
    
    var UserID = request.query.user_id;  
    toSend ={
      "price" : 100  
    }

    qstring = "select price from  promo_code_price , user_promo_code "+ 
              "where promo_code_price.promo_code = user_promo_code.promo_code and " + 
              "user_id ="+UserID+" ; " ; 
    console.log(qstring); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
        console.log(result);
        if (result.length!= 0 )
           response.send (result[0] ) ;
        else
          response.send(toSend) ;  
      }

    });
    

  
});


function getUserID (email , callback) 
{
     var qstring ="select user_id from user where "+
                 "user_email = '"+email+"';" ; 
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


function checkEmailExist (email , callback) 
{
     var qstring ="select user_id from user where "+
                 "user_email = "+email+";" ; 
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


function checkPhoneExist (no , callback) 
{
     var qstring ="select user_id from user where "+
                 "phone_no = "+no+";" ; 
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

app.get("/register", function(request, response) {

    var UserName = request.query.user_name ; 
    var password = request.query.password ; 
    var degree = request.query.degree ; 
    var user_email = request.query.user_email ; 
    var school = request.query.school ; 
    var phone_no = request.query.phone_no ;
    
   
    checkEmailExist(user_email, function(emailResult){

        if (emailResult.length !=0) {
          err = 1 ; 
          response.send("email already exist");
         
        }
        else {
        
         checkPhoneExist(phone_no , function(phoneResult){
              
              if(phoneResult.length != 0 ){
               response.send("phone no already exist"); 
          }

            else {
          // execute a query on our database
                var qstring = "INSERT INTO USER ( user_name, password , degree , user_email , school , phone_no  , user_image_link) VALUES('"
                              +UserName+"','"+password +"','" +degree+"','"+user_email +"','" +school+"','"+phone_no +"' , 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkIzTVGyP4xWTBn5OFGWp6-6d5XjH1CzOoAdzCfoeG4Sf9z9b3');"; 
                console.log("the query: "+qstring +"\n"); 
                connection.query(qstring , function (err, result) {
                  if (err) {
                  console.log(err);
                response.status(500).send(err);
                } else {
                  response.send(result) ;
                }

            });

          }
       });

        }
    });
        
});
// funcitons for user profile page : 
app.get("/user_info", function(request, response) {

    var userID = request.query.id  
  
   var profileServer = require ("./page_modules/profileServer") 
    profileServer.GetUserInfo(connection , response , userID  ); 
  
});

app.get("/user_simulations", function(request, response) {

    var userID = request.query.id  ;

    

   var profileServer = require ("./page_modules/profileServer") 
    profileServer.GetUserSimulations(connection , response , userID  ); 
  
});

function getMonthName (monthNumber){

  switch(monthNumber){

    case 0 : 
      return "January" ; 
     // break ; 
    case 1 : 
      return "February" ;
    case 2 : 
      return "March"  ; 
    case 3 : 
      return "April"  ; 
    case 4 : 
      return "May" ;
    case 5 : 
      return "June"  ; 
    case 6 : 
      return "July" ;
    case 7 : 
      return "August"  ; 
    case 8 : 
      return "September" ;
    case 9 : 
      return "October"  ; 
    case 10 : 
      return "November" ;
    case 11 : 
      return "December"  ; 

  }
}
function TransfromDate (date)
{

  //svar dd = new Date () ; 
  //dd.getMonth ; 
  var send ; 
    if(date.getHours()==2)
    {
      send =getMonthName("During the Month of "+date.getMonth() );
       
      console.log ("month" , send) ; 
    }
    else { 
      var datos = date.toDateString() ;
      var time = date.getHours() ; 
      var Label = " AM"; 
      if (time > 12 ){
        time = time - 12 ; 
        Label =" PM"; 
      }
      //console.log(time); 
      send = datos +" at " + time +""+Label ; 
    }
    return send ; 
   // console.log(send); 
}

function RandomStringGen(len)
{
    var text = " ";
    
    var charset = "ABCDEFGHIJKLMNOPQRSYUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for( var i=0; i < len; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    
    return text;
}
 
function AuthenticationRequest (callback){
var unirest = require("unirest"); 

var req = unirest("POST", "https://accept.paymobsolutions.com/api/auth/tokens");

    req.headers({
      "content-type": "application/json"
    });

    req.type("json");
    req.send({
      "username": "Fast Forward",
      "password": "June2011$$",
      "expiration": "36000"
    });

    req.end(function (res) {
      if (res.error) throw new Error(res.error);
      var SendObj = {
        "firstToken" : res.body.token , 
        "Mid" : res.body.profile.id 
      }

    //  InsertGarbage ( "hello iam in the first step and this is the token" + SendObj.firstToken); 
      callback(SendObj); 
     });

  
}
function CreateOrder (data , UserID, Price , SimulationDateID,  callback) {


console.log("UserID", UserID); 
console.log("Price", Price); 
console.log("simID", SimulationDateID); 
var unirest = require("unirest"); 

//var unirest = require("unirest");

var req = unirest("POST", "https://accept.paymobsolutions.com/api/ecommerce/orders");

req.query({
  "token": data.firstToken 
});

req.headers({
  "content-type": "application/json"
});

req.type("json");
req.send({
  "delivery_needed": "false",
  "merchant_id":data.Mid,
  "merchant_order_id": RandomStringGen(20),
  "amount_cents": Price +"00",
  "currency": "EGP",
  "items":[],
  "user_id" : UserID , 
  "shipping_data":{
    "first_name": UserID, 
    "phone_number": "+201003978030", 
    "last_name":SimulationDateID,
    "email": "mr@g.com",
    "apartment": "803",
    "floor": "42",
    "street": "sample street",
    "building": "4055",
    "postal_code": "33221",
    "country": "EG",
    "city": "Cairo",
    "user_id": UserID
  }
});



console.log("hello im here") ; 
req.end(function (res) {
  if (res.error) throw new Error(res.error);
  console.log("hello I came out") ; 
  console.log(res.body);
  data["orderId"] = res.body.id ;
  callback(data) ;  
});
}


/*
function CreatePaymentKey(data , callback){

InsertGarbage("inside payment and the order id is"+ data.orderId) ; 
 // var unirest = require("unirest");
//var unirest = require("unirest"); 

var req = unirest("POST", "https://accept.paymobsolutions.com/api/acceptance/payment_keys");

req.query({
  "token": data.firstToken
});

req.headers({
  "content-type": "application/json"
});

req.type("json");
req.send({
  "amount_cents": "25000",
  "currency": "EGP",
  "card_integration_id": "184",
  "order_id": data.orderId,
  "billing_data": {
      "apartment": "803", 
      "email": "claudette09@exa.com", 
      "floor": "42", 
      "first_name": "Clifford", 
      "street": "Ethan Land", 
      "building": "8028", 
      "phone_number": "+86(8)9135210487", 
      "shipping_method": "PKG", 
      "postal_code": "01898", 
      "city": "Jaskolskiburgh", 
      "country": "CR", 
      "last_name": "Nicolas", 
      "state": "Utah"
  }
});
req.end(function (res) {
  if (res.error) throw new Error(res.error);
   data["paymentToken"] = res.body.token ; 
  //console.log(res.body);
  InsertGarbage("inside payment now sending the fucken response ");
  InsertGarbage("inside payment now sending the fucken response2 " +data.orderId );
  InsertGarbage("inside payment now sending the fucken response2 " + data.paymentToken );

  callback (data); 
});
}
*/

function CreatePaymentKey(data ,price , callback){

console.log("rec data is ", data) ; 
  var unirest = require("unirest");

var req = unirest("POST", "https://accept.paymobsolutions.com/api/acceptance/payment_keys");

req.query({
  "token": data.firstToken
});

//InsertGarbage ("the first token inside payment: "+data.firstToken);
//InsertGarbage ("another basic data" + data.orderId)  ;
//InsertGarbage ("some basic string"); 

req.headers({
  "content-type": "application/json"
});

req.type("json");
req.send({
  "amount_cents":price+"00" ,
  "currency": "EGP",
  "card_integration_id": "184",
  "order_id": data.orderId,
  "billing_data": {
      "apartment": "803", 
      "email": "claudette09@exa.com", 
      "floor": "42", 
      "first_name": "Clifford", 
      "street": "Ethan Land", 
      "building": "8028", 
      "phone_number": "+86(8)9135210487", 
      "shipping_method": "PKG", 
      "postal_code": "01898", 
      "city": "Jaskolskiburgh", 
      "country": "CR", 
      "last_name": "Nicolas", 
      "state": "Utah"
  }
});

req.end(function (res) {
  if (res.error) {
    InsertGarbage ("a fucken error happened man ") ; 
    throw new Error(res.error);
  }
  data["paymentToken"] = res.body.token ; 
  // InsertGarbage("inside payment now sending the fucken response2 " + data.paymentToken );
  console.log(res.body);
  callback (data); 
});
}



function uploadIframe(data , callback){

  var unirest = require("unirest");



  var req = unirest("POST", "https://accept.paymobsolutions.com/api/acceptance/iframes");

  req.query({
    "token": data.firstToken
  });

  req.headers({
    "content-type": "application/json"
  });

  req.type("json");
  req.send({
    "name": "test1",
    "description": "end to end iframe testing",
    "content_html":  data.HTML,
    "content_js": "console.log('this is your javascript');",
    "content_css": ".container {color: black;}"
  });

  req.end(function (res) {
    if (res.error) throw new Error(res.error);

      console.log(res.body);
      callback(res.body); 
  });
}
function InsertGarbage (data){
    data = String(data); 
    var str = "INSERT INTO Garbage VALUES('"+data+"');" ; 
    connection.query(str , function (err, result) {
      if (err) {
        console.log(err);
      // response.status(500).send(err);
      } else {
        console.log(result);
      // response.send(result);
      }

    });
}

app.get("/check-date", function(request, response) {
    
   // var data = request.query.data ; 
   var current = new Date () ;
   var toSend = {
     "result": false , 
     "dead_line" : ""   
   } 
   str = "select * from appDetails where appKey = 'dead_line' " ; 
     connection.query(str , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          
          var deadLine = new Date(result[0].appValue) ; 
          if (current.getTime()  <  deadLine.getTime())
            {
                console.log("yes mother d"); 
                // toSend["day"] = diffDays ; 
                // toSend["hour"] = diffhours ; 
                // toSend["min"] =  diffmins ; 
                toSend.result = true ; 
            }
            else 
                console.log("no man");   

            toSend.dead_line = deadLine ; 
            response.send(toSend) ;
            
      }
    });
   
  //  var timeDiff = Math.abs(deadLine.getTime() - current.getTime());
  //  var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));  
  //  var diffhours = Math.floor((timeDiff-diffDays*1000*3600*24)/(1000*3600)) ; 
  //  var diffmins= Math.floor(((timeDiff-diffDays*1000*3600*24)-diffhours*1000*3600) /(1000 * 60) ) ; 


  //  console.log("day diff",diffDays);
  //  console.log("hour diff" , diffhours) ; 
  //  console.log( "min diff" , diffmins) ; 
   
   
});


app.get("/check-date-test", function(request, response) {
    
   // var data = request.query.data ; 
   var current = new Date () ;
   var toSend = {
     "result": false , 
     "dead_line" : ""   
   } 
   str = "select * from appDetails where appKey = 'dead_line2' " ; 
     connection.query(str , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          
          var deadLine = new Date(result[0].appValue) ; 
          if (current.getTime()  <  deadLine.getTime())
            {
                console.log("yes mother d"); 
                // toSend["day"] = diffDays ; 
                // toSend["hour"] = diffhours ; 
                // toSend["min"] =  diffmins ; 
                toSend.result = true ; 
            }
            else 
                console.log("no man");   

            toSend.dead_line = deadLine ; 
            response.send(toSend) ;
            
      }
    });
   
   
});

app.get("/check-expo-date", function(request, response) {
    
   // var data = request.query.data ; 
   var current = new Date () ;
   var toSend = {
     "result": false , 
     "dead_line" : ""   
   } 
   str = "select * from appDetails where appKey = 'dead_line_expo' " ; 
     connection.query(str , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          
          var deadLine = new Date(result[0].appValue) ; 
          if (current.getTime()  <  deadLine.getTime())
            {
                toSend.result = true ; 
            }
            toSend.dead_line = deadLine ; 
            response.send(toSend) ;
            
      }
    });
   
   
});

function checkExpo(userId , callback) {
    
   var toSend = {
     "expo": false ,  
   } 
   str = "select * from user_attending_expo where user_id = "+userId ; 
     connection.query(str , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {

        if(result.length>0){
          toSend.expo  = true  ; 
        }


          callback(toSend) ; 
      }
  
   
   
}) ; 

}


function getSimDateIDForUser (userID , SimulationID , callback){

 var qstring = "select applications.simulation_date_id , price from simulation , simulation_date ,applications " +
                "where simulation.simulation_id = simulation_date.simulation_id and "+
                "simulation_date.simulation_date_id = applications.simulation_date_id and " + 
                "user_id ="+userID+" and simulation.simulation_id = " +SimulationID ; 
                 connection.query(qstring , function (err, result) {
                    if (err) {
                      console.log(err);
                       callback(err);
                    } else {
                      console.log(result);
                      data = {
                        "simulation_date_id": result[0].simulation_date_id , 
                        "price": result[0].price 
                      }
                      callback(data) ; 
                    }

                  });
}


app.post("/test", function(request, response) {
    
    var userID = request.body.user_id ; 
    var SimID =request.body.simulation_id ; 
    getSimDateIDForUser (userID,  SimID , function (IDAndPrice){

        var simulationDateID = IDAndPrice.simulation_date_id ; 
        var Price = IDAndPrice.price ; 
      
        AuthenticationRequest(function (recObj){
      //   InsertGarbage("Finished the first step");
      // console.log("UserID", UserID); 
    //console.log("Price", Price); 
    //console.log("simID", SimulationDateID); 
          CreateOrder(recObj ,userID ,Price , simulationDateID ,  function (dataRecieved1){
                // InsertGarbage("data recived after the second step is"+dataRecieved1.orderId) ;
                  CreatePaymentKey (dataRecieved1 , Price ,  function(dataRecieved2){
                                  //  var sendReq  = require ('request') ; 

                                    // InsertGarbage("paytoc step3"+dataRecieved2.paymentToken) ; 

                                    var toSend  = {
                                      "url" : "https://accept.paymobsolutions.com/api/acceptance/iframes/2260?payment_token="+dataRecieved2.paymentToken
                                    }

                                    response.send(toSend) ; 
                                    // var uri ="https://accept.paymobsolutions.com/api/acceptance/iframes/1995?payment_token="+dataRecieved2.paymentToken; 
                                    // sendReq(uri,function  (error, res, body) {
                                    //   if (error)
                                    //     console.log(error) ;
                                    //   if (!error && res.statusCode == 200) {
                                    //     console.log(body); // Print the google web page.
                                    //     response.send(body);
                                    //   }

                                    //   console.log(body); 
                                    // }) ; 
                                    
                  });

          });
        });

   });

 }) ;

 app.get("/test", function(request, response) {
    
    var userID = 324 ; 
    var SimID =14 ; 
    getSimDateIDForUser (userID,  SimID , function (IDAndPrice){

        var simulationDateID = IDAndPrice.simulation_date_id ; 
        var Price = IDAndPrice.price ; 
      
        AuthenticationRequest(function (recObj){
      //   InsertGarbage("Finished the first step");
      // console.log("UserID", UserID); 
    //console.log("Price", Price); 
    //console.log("simID", SimulationDateID); 
          CreateOrder(recObj ,userID ,Price , simulationDateID ,  function (dataRecieved1){
                // InsertGarbage("data recived after the second step is"+dataRecieved1.orderId) ;
                  CreatePaymentKey (dataRecieved1 , Price ,  function(dataRecieved2){
                                  //  var sendReq  = require ('request') ; 

                                    // InsertGarbage("paytoc step3"+dataRecieved2.paymentToken) ; 

                                    var toSend  = {
                                      "url" : "https://accept.paymobsolutions.com/api/acceptance/iframes/2260?payment_token="+dataRecieved2.paymentToken
                                    }

                                    response.send(toSend) ; 
                                    // var uri ="https://accept.paymobsolutions.com/api/acceptance/iframes/1995?payment_token="+dataRecieved2.paymentToken; 
                                    // sendReq(uri,function  (error, res, body) {
                                    //   if (error)
                                    //     console.log(error) ;
                                    //   if (!error && res.statusCode == 200) {
                                    //     console.log(body); // Print the google web page.
                                    //     response.send(body);
                                    //   }

                                    //   console.log(body); 
                                    // }) ; 
                                    
                  });

          });
        });

   });

 }) ;

 app.get("/test1", function(request, response) {
    
  
  var req = unirest("POST", "https://accept.paymobsolutions.com/api/auth/tokens");

    req.headers({
      "content-type": "application/json"
    });

    req.type("json");
    req.send({
      "username": "Fast Forward",
      "password": "June2011$$",
      "expiration": "36000"
    });

    req.end(function (res) {
      if (res.error) throw new Error(res.error);
      var SendObj = {
        "firstToken" : res.body.token , 
        "Mid" : res.body.profile.id 
      }
      response.send(SendObj); 
     });

  
 }) ;
app.post("/paymob_notification_callback?hmac=9FAEDD1FF8E8B2E9B78E6BDB60C2A14A", function(request, response) {
    
    console.log("i have got a biiig response", request.body ) ; 
    var str = "INSERT INTO Garbage VALUES('HELLO POst');"
    connection.query(str , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
        console.log(result);
      // response.send(result);
      }

    });
    response.send(); 
 }) ;


function ConfirmPayment (userID , simulationDateID ) { 

   qstr = "update applications set status = 'accepted' where user_id ="+userID+" and simulation_date_id = "+simulationDateID ; 
    console.log(str); 
     connection.query(str , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          
          response.send(result);
          }
           
    });

}
 app.post("/paymob_notification_callback", function(request, response) {
    
    //console.log("i have got a biiig response", request.body ) ; 
    var UserID = request.body.obj.order.shipping_data.first_name; 

    var price = request.body.obj.order.amount_cents; 

    var simulationDateID = request.body.obj.order.shipping_data.last_name; 

    var PaymentDate = new Date ().toISOString().replace("T"," ").replace("Z","") ; 

    var qstring = "update applications set status = 'accepted' , payment_date = '"+PaymentDate+"' where user_id = "+UserID +
    " and simulation_date_id=" + simulationDateID ;  

    InsertGarbage (qstring);  
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          
          response.send(result);
          }
           
    });
  //  InsertGarbage("Hello Post id "+ UserID) ; 
  //  InsertGarbage ("Hello Post price "+ price) ; 
  // InsertGarbage ("Hello Post form simID "+ simulationDateID) ; 

    // var str = "INSERT INTO Garbage VALUES('HELLO POst "+UserID+"');"
    // connection.query(str , function (err, result) {
    //   if (err) {
    //     console.log(err);
    //    response.status(500).send(err);
    //   } else {
    //     console.log(result);
    //   // response.send(result);
    //   }

    // });
    response.send(); 
 }) ;

app.get("/paymob_txn_response_callback", function(request, response) {
    
  //  console.log("i have got a biiig response", request.body ) ; 
    var str = "INSERT INTO Garbage VALUES('HELLO Get');"
    connection.query(str , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
        console.log(result);
      // response.send(result);
      }

    });
    var price = request.query.amount_cents ; 
    var responseMsg = "you have Successfully payed "+price+" EGP to FastForward\nEnjoy Your Simulation" ; 
    response.send(responseMsg); 
 }) ;




app.get("/forgot-password", function(request, response) {

    var UserEmail = request.query.user_email ; 

    var Login = require("./page_modules/loginServer") ; 
    Login.ForgotPassword(connection, response , UserEmail) ; 
    
   
});
app.get("/like-video", function(request, response) {
    
    var videoID = request.query.video_id ;
    var userID = request.query.user_id;  

   var videoServer = require("./page_modules/videoServer") ; 
    videoServer.LikeVideo(connection, response , userID , videoID) ; 
   
});

app.post("/add-video", function(request, response) {
    
    var companyID = request.body.company_id ;
    var description = request.body.description;
    var videoLink = request.body.video_link ;   
    videoLink = videoLink.replace("watch?v=", "embed/");

    var qstring = "INSERT INTO company_video (company_id , video_link , description) "+
                  "VALUES("+companyID+",'"+videoLink+"','"+description+"');";  
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {

        response.send(result); 
      }

    });
   
});
app.get("/dislike-video", function(request, response) {
    
    var videoID = request.query.video_id ;
    var userID = request.query.user_id;  


      var videoServer = require("./page_modules/videoServer") ; 
    videoServer.DisLikeVideo(connection, response , userID , videoID) ; 
   
});
app.get("/user-liked-videos", function(request, response) {

    var UserID = request.query.user_id ;  
    var toSend = {
      "result" : false  
    } ; 
  
    // execute a query on our database
    var qstring = "select company_video.video_id, company.company_id, company_name , video_link , company_video.description , likes , profile_pic_link "+
                  "from company,  company_video , user_like_video  "+
                  "where company_video.video_id = user_like_video.video_id and " +
                  " company.company_id = company_video.company_id and user_id ="+ UserID +";" ; 
    console.log("the query: "+qstring +"\n"); 

    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          var counter = 0 ; 
         for (i = 0 ; i < result.length ; i++){
            result[i]["liked_by_user"]= true ; 
         }
         
         console.log(result); 
         // console.log(JSON.stringify(toSend)); 
          response.send (result);  
    
      }

    });
});
app.get("/not-liked-videos", function(request, response) {

    var UserID = request.query.user_id ;  

    // execute a query on our database
    var qstring = "select company_video.video_id, company.company_id, company_name , video_link , company_video.description , likes , profile_pic_link " +
                  "from company,  company_video "+ 
                  "where company.company_id = company_video.company_id and  video_id not IN ("+
                  "select company_video.video_id from company,  company_video , user_like_video "+ 
                  "where company_video.video_id = user_like_video.video_id and "+
                  "company.company_id = company_video.company_id " +
                  "and user_id ="+ UserID +");" ; 
                 
    console.log("the query: "+qstring +"\n"); 

    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          var counter = 0 ; 
         for (i = 0 ; i < result.length ; i++){
            result[i]["liked_by_user"]= false ; 
         }
         
         console.log(result); 
         // console.log(JSON.stringify(toSend)); 
          response.send (result);  
    
      }

    });
});

app.get("/follow-company", function(request, response) {
    
    var companyID = request.query.company_id ;
    var userID = request.query.user_id;  

     var GHF = require("./page_modules/GlobalHelperFunctions") ; 
    GHF.FollowCompany(connection, response , userID ,companyID) ; 
});

app.get("/get-date-votes", function(request, response) {
    
    var simulationID = request.query.simulation_id ;

    var qstring = "select distinct  date , votes , simulation_date.simulation_date_id as id from date_voting , simulation_date where "+
                  "date_voting.simulation_date_id = simulation_date.simulation_date_id "+
                  "and simulation_id =" +simulationID;  
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
        for (i = 0 ; i < result.length ; i++)
        {
          result[i].date = TransfromDate(result[i].date) ; 
        }
        response.send(result); 
      }

    });
   
});



app.get("/vote-for-date", function(request, response) {
    
   var SimDateID = request.query.simulation_date_id ;
    var userID = request.query.user_id;  
    var toSend = {
      "msg": "" 
    } 
    var qstring = "INSERT INTO date_voting VALUES("+userID+","+SimDateID+");";  
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
              if (err.message.match("Duplicate")){
                      toSend.msg = "You already voted for this date"; 
                      response.send(toSend); 
              }else 
              response.send(toSend) ;   
      } else {
         var qstring = "UPDATE simulation_date SET votes = votes+1 where simulation_date_id="+SimDateID+";" ;   
        connection.query(qstring , function (err, result2) {
              if (err) {
                         response.send(toSend) ;   

              } else {

            
                response.send(toSend) ; 
              }

            });
      }

   
  });


}); 

app.get("/get-promo-code-discount", function(request, response) {

    var pormoCode = request.query.promo_code ;
    var companyID = request.query.company_id ;  
    var toSend = {
      "result" : false 
    }
    str ="select * from company_promo_code where (company_id ="+companyID+" or company_id = 0)" + 
         " and promo_code='"+pormoCode+"'" ;  
    console.log(str); 
     connection.query(str , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          
          response.send(result);
          }
           
    });
    
});

app.get("/get-applicants", function(request, response) {

    var simDateID = request.query.simulation_date_id ; 
   
    var applicantsServer = require ("./page_modules/applicantsServer") 
    applicantsServer.GetApplicants(connection , response , simDateID  ); 
});


app.get("/unfollow-company", function(request, response) {
    
    var companyID = request.query.company_id ;
    var userID = request.query.user_id;  

     var GHF = require("./page_modules/GlobalHelperFunctions") ; 
    GHF.UnFollowCompany(connection, response , userID ,companyID) ; 
   
});


app.get("/apply", function(request, response) {
    
    var simulationDateID = request.query.simulation_date_id ;
    var userID = request.query.user_id;  
     var Company = require("./page_modules/companyServer") ;
     Company.apply(connection, response, simulationDateID , userID) ;  
});
app.get("/queryList", function(request, response) {
    

    var qstring = request.query.q ; 
    var qList = qstring.split(";"); 
    for ( i = 0 ; i < qList.length ; i++)
    {
      qstring = qList [i] ;
      if (qstring.length == 0 )
        continue ; 
      console.log(qstring); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
        console.log(result);
      // response.send(result);
      }

    });
    }
    
    response.send ("all querys executed successfully" ) ; 

  
});


app.get("/allVideos", function(request, response) {

    var UserID = request.query.user_id ;  
 
    var videoServer  = require("./page_modules/videoServer") ; 

    videoServer.GetAllVideos(connection , response,UserID ) ;    
});
app.get("/company_details", function(request, response) {

    var companyID = request.query.company_id ;  
    var CompanyServer  = require("./page_modules/companyServer") ; 

    CompanyServer.GetCompanyDetails(connection , response,companyID ) ; 

});



app.get("/get_company_simulations", function(request, response) {
    
    var companyID = request.query.company_id ;
   
    var AcceptApplicants = require("./page_modules/acceptApplicantsServer") ;
    AcceptApplicants.GetCompanySimulations(connection, response, companyID) ; 
});

app.get("/get-field-simulation", function(request, response) {
    
    var userID = request.query.user_id ; 
    var fieldID = request.query.field_id ;
    var qstring = "select * from simulation where field_id=" +fieldID+ ";";
                 
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
        var counter = 0 ; 
       for (i = 0  ; i < result.length ; i++){
          
         getSimDetails(result, i , userID, function (ResutWithDates){
            result = ResutWithDates ; 
            counter += 1 ; 
            if (counter === result.length)
               response.send (result) ;
         });
       }
       
      }

    });
  
});
function getSimulationStatus (simulations , index, simID , userID ,callback){

  var  qstring =  "select status as status  from simulation , simulation_date , applications "+
                "where simulation.simulation_id = simulation_date.simulation_id and "+  
                "simulation_date.simulation_date_id = applications.simulation_date_id "+
                "and simulation.simulation_id ="+ simID+" and user_id="+userID ; 

       console.log("the query: "+qstring +"\n"); 
      connection.query(qstring , function (err, result) {
      if (err) {
      // response.status(500).send(err);
        console.log("error in get sim status applicants") ; 
      } else { 
        if(result.length > 1 )
          simulations[index]["status"] ="View Status";  
        else if (result.length === 1 )
          simulations[index]["status"] =result[0].status;  
        else 
          simulations[index]["status"] ="";  

        callback(simulations) ; 
      }

    });
  
}

function getNumberOfApplicants (simulations , index, simID , callback){

var  qstring =  "select count(*) as count  from simulation , simulation_date , applications "+
                "where simulation.simulation_id = simulation_date.simulation_id and "+  
                "simulation_date.simulation_date_id = applications.simulation_date_id "+
                "and simulation.simulation_id ="+ simID ; 

       console.log("the query: "+qstring +"\n"); 
      connection.query(qstring , function (err, result) {
      if (err) {
      // response.status(500).send(err);
        console.log("error in get num of applicants") ; 
      } else { 
        simulations[index]["number_of_applicants"] =result[0].count;  
        callback(simulations) ; 
      }

    });
  
}
function getSimDetails (simulations , index , userID,   callback ){
      var SimID = simulations[index].simulation_id ; 
      // get dates 
    var qstring = "select * from simulation_date where votes = 0 and  simulation_id=" +SimID +";" ;  
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
      // response.status(500).send(err);
      console.log("error in get dates") ; 
    } else {
        var Dates = [] ;
        
        for (i = 0 ; i< result.length ; i++){
          var temp = {
          "date_id":"" , 
          "date":""  
        } ; 
           temp.date_id = result[i].simulation_date_id ;
           temp.date =  TransfromDate( result[i].date) ;
           Dates.push(temp) ; 
           console.log(result[i]) ;
        }
        //console.log("done ya maw");
        simulations[index]["dates"] =Dates; 

        getNumberOfApplicants(simulations , index ,SimID, function(TheSim){
              getSimulationStatus(TheSim , index ,SimID , userID , function(TheFinalSim){
                            callback(TheFinalSim) ; 
              });

        }) ;
      }

    });
  

}

app.get("/get_company_simulations2", function(request, response) {
    
    var userID = request.query.user_id ;
    var companyID = request.query.company_id ;

    var Company = require("./page_modules/companyServer") ;
   Company.GetCompanySimulations(connection, response, companyID , userID)
   
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

app.get ("/user_delete_simulation" ,  function(request, response) {

  var UserID = request.query.user_id ; 
  var simulationID = request.query.simulation_id ; 

  
   var profileServer = require ("./page_modules/profileServer") ; 
    profileServer.DeleteUserSimulation(connection , response , UserID , simulationID  ); 

});

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


app.get("/gar", function(request, response) {

    // execute a query on our database
    var q = request.query.q ; 

    qstring = "INSERT INTO Garbage VALUES ('"+q+"');"; 
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


function insertNewDate (simID , date,response ,callback){

    qstring = "INSERT INTO simulation_date ( simulation_id  , date , votes ) VALUES ("+simID+",'"+date+"',1);"; 
    console.log(qstring); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
        InsertGarbage("error in insert new date "); 
      } else {
       // console.log(result);
      // response.send(result);
      callback() ; 
      }

    });

}

function getSimDateID (simID , date , response,  callback){

 qstring = "select simulation_date_id from simulation_date where simulation_id="+simID+" and date ='"+date+"'"; 
    console.log(qstring); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
       InsertGarbage("error in get sim id "); 
      } else {
       // console.log(result);
       callback(result[0].simulation_date_id);
      }

    });

}



function insertUserVote (userID , simDateID , response ,callback){

    qstring = "INSERT INTO date_voting  VALUES ("+userID+","+simDateID+");"; 
    console.log(qstring); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
        InsertGarbage("error in insert user vote "); 
       response.status(500).send(err);
      } else {
       // console.log(result);
     //  callback(result);
        callback(result) ; 
      }

    });

}

app.get("/request-new-time", function(request, response) {

    // execute a query on our database
    var userID = request.query.user_id ; 
    var simulationID = request.query.simulation_id ; 
    var date = request.query.date ; 
    date = date.replace("Z" , " ");  
    date = date.replace("T" , " ") ; 
   // InsertGarbage("hello iam here"); 

    var toSend = {
      "simDateID": ""

    }
  //  InsertGarbage(userID + simulationID + date );
  //  var userID = request.body.user_id ; 
    insertNewDate(simulationID , date , response,  function(){
      getSimDateID(simulationID , date , response , function(simDateID){
          insertUserVote(userID , simDateID, response,  function(result){ ; 
           
           toSend.simDateID = simDateID ; 
           response.send(toSend) ; 
           })
      }); 

  });
    
});

app.get("/dateso", function(request, response) {

    // execute a query on our database
    //var q = request.query.q ; 
  

    qstring = "select * from simulation_date"; 
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
// Now we go and listen for a connection.
app.listen(port);

require("cf-deployment-tracker-client").track();
