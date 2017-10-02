exports.GetPaymentUrl  = function (connection , response ) { 

 AuthenticationRequest(function (recObj){
   //   InsertGarbage("Finished the first step");
      CreateOrder(recObj , function (dataRecieved1){
             // InsertGarbage("data recived after the second step is"+dataRecieved1.orderId) ;
              CreatePaymentKey (dataRecieved1 , function(dataRecieved2){
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


function CreateOrder (data , callback) {

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

function CreatePaymentKey(data , callback){

    console.log("rec data is ", data) ; 
    var unirest = require("unirest");

    var req = unirest("POST", "https://accept.paymobsolutions.com/api/acceptance/payment_keys");

    req.query({
    "token": data.firstToken
    });

    //InsertGarbage ("the firunction CreatePaymentKey(data , callback){

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
