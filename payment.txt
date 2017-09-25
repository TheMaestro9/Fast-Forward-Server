
 // First add the obligatory web framework
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var url = require ('url'); 
app.use(bodyParser.urlencoded({
  extended: false
}));
var sendReq  = require ('request') ;
var unirest = require("unirest"); 

var port = process.env.PORT || 8080;
app.get("/test", function(request, response) {
    
    AuthenticationRequest(function (recObj){
      console.log(recObj);
      CreateOrder(recObj , function (dataRecieved1){
              console.log("data recived after the second step is",dataRecieved1.orderId) ;
              CreatePaymentKey (dataRecieved1 , function(dataRecieved2){
                                console.log("paytoc",dataRecieved2.paymentToken) ; 
                                var url ="https://accept.paymobsolutions.com/api/acceptance/iframes/1995?payment_token="+dataRecieved2.paymentToken; 
                                sendReq(url,function  (error, res, body) {
                                  if (error)
                                    console.log(error) ;
                                  if (!error && res.statusCode == 200) {
                                    console.log(body); // Print the google web page.
                                    response.send(body);
                                  }

                                  console.log(body); 
                                }) ; 
                                
              });

      });
    });
 }) ;

 function AuthenticationRequest (callback){

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
      callback(SendObj); 
     });

  
}
function CreateOrder (data , callback) {


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
  "amount_cents": "25000",
  "currency": "EGP",
  "items": [],
  "shipping_data":{
    "first_name": "test_user", 
    "phone_number": "+201003978030", 
    "last_name": "test_user",
    "email": "mr@g.com",
    "apartment": "803",
    "floor": "42",
    "street": "sample street",
    "building": "4055",
    "postal_code": "33221",
    "country": "EG",
    "city": "Cairo"
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

function RandomStringGen(len)
{
    var text = " ";
    
    var charset = "ABCDEFGHIJKLMNOPQRSYUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for( var i=0; i < len; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    
    return text;
}

function CreatePaymentKey(data , callback){

console.log("rec data is ", data) ; 
  var unirest = require("unirest");

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
   console.log("inside payment now sending the fucken response2 " + data.paymentToken );
  console.log(res.body);
  callback (data); 
});
}

app.post("/paymob_notification_callback", function(request, response) {
    
    console.log("i have got a biiig response", request.body ) ; 
    var str = "INSERT INTO Garbage VALUES('HELLO');"
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
 app.get("/testo", function(request, response) {
    
    var str = "https://www.youtube.com/watch?v=mkualZPRZCs";
    str = str.replace("watch?v=", "embed/");
    console.log(str); 
    response.send(str); 
    // 
 }) ;


 app.post("/paymob_notification_callback", function(request, response) {
    
     ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // in my code this function should insert some thing in the data base but i guess you don't need that in your test
   /////////////////////////////////////////////////////////////////////////////////////////////////////
    response.send(); 
 }) ;



 app.get("/paymob_txn_response_callback", function(request, response) {
    

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // in my code this function should insert some thing in the data base but i guess you don't need that in your test
   /////////////////////////////////////////////////////////////////////////////////////////////////////
    response.send(); 
 }) ;


 app.listen(port);
