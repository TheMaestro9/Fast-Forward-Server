var CryptoJS = require("crypto-js");
exports.Login  = function (connection , response , UserEmail ,password) { 

     var toSend = {
      "result" : false  
    } ; 
    // execute a query on our database
    var qstring = "select user_name , user_id , company_or_not from user where user_email ='"+UserEmail+"' and password='"+password +"'"; 
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

       //   checkExpo (result[0].user_id , function(reso){

              toSend.result= true ;
         //     toSend  = Object.assign(toSend , reso) ;
              toSend  = Object.assign(toSend , result[0]) ;
              response.send (toSend);  
        //  }) ; 
          
        }
      }

    });
}

exports.ForgotPassword  = function (connection , response , UserEmail ) { 
 var toSend = {
      "result" : false  , 
      "msg" : "" 
    } ; 
    console.log("INNNNNNNNN") ; 
   
    // execute a query on our database
    getUserPassword( connection , response , UserEmail ,  function (result) {
    
        console.log("HEreeeeee",result) ; 
        if (result.length === 0)
        {
        toSend.msg = "You Are Not Registered, Please Register" ; 
         response.send(toSend); 

        }
        else {
          GHF = require("./GlobalHelperFunctions") ; 
          console.log("going to send the email") ;
          var qstring = "select user_id from user where user_email ='"+UserEmail+"'"; 
          console.log("the query: "+qstring +"\n"); 
          connection.query(qstring , function (err, r) {
            if (err) {
              console.log(err);
             response.status(500).send(err);
            } else {
              console.log("RRRR",r[0].user_id)
              GHF.SendAnEmail(UserEmail ,'Change Password','http://ffserver.eu-gb.mybluemix.net/forget1?user_id='+r[0].user_id) ; 
              toSend.result= true ;
              toSend.msg  = "An Email Has Been Sent To You With your Password Check It Out!" ;
            }
          
          });
         
          response.send (toSend);  
        }
      

    });
}
function getUserID(connection,response,userEmail,callback){
  var qstring = "select user_id from user where user_email ='"+userEmail+"'"; 
  console.log("the query: "+qstring +"\n"); 
  connection.query(qstring , function (err, result) {
    if (err) {
      console.log(err);
     response.status(500).send(err);
    } else {
      callback(result) ; 
    }
  
  });
}

function getUserPassword (connection , response , userEmail , callback){

    var qstring = "select password from user where user_email ='"+userEmail+"'"; 
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
        callback(result) ; 
      }

    });

}

exports.encryptAllPasswords=function(connection,response){
  connection.query('SELECT password FROM user', function(err,result) {
    if (err) {
      console.log(err);
     response.status(500).send(err);
    } else {
      console.log('Password: ', result.length);
      for(i=0;i<result.length;i++)
      {
        console.log('Password: ',i, result[i].password)
        var wordArray = CryptoJS.enc.Utf8.parse(result[i].password);
        var base64 = CryptoJS.enc.Base64.stringify(wordArray);
        console.log('encrypted:', base64);
        var qstring = "update user set password='"+base64+ "' where user_id="+(i+1);
        connection.query(qstring , function (err, result) {
        if (err) {
        console.log(err.message); 
        response.send(err) ;
        } else {
         console.log("PASSS ENCRYPTEDDDD")
        }
          });
      };
    }
  
  });
}

exports.LoginAfterEncryption  = function (connection , response , UserEmail ,password) { 
     var wordArray = CryptoJS.enc.Utf8.parse(password);
     var base64 = CryptoJS.enc.Base64.stringify(wordArray);
     console.log('encrypted:', base64);
       var toSend = {
        "result" : false  
      } ; 
      // execute a query on our database
      var qstring = "select user_name , user_id , company_or_not from user where user_email ='"+UserEmail+"' and password='"+base64 +"'"; 
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
  
         //   checkExpo (result[0].user_id , function(reso){
  
                toSend.result= true ;
           //     toSend  = Object.assign(toSend , reso) ;
                toSend  = Object.assign(toSend , result[0]) ;
                response.send (toSend);  
          //  }) ; 
            
          }
        }
  
      });
  }

exports.changePassword=function(connection,request,response) {
  console.log("REQ PASS",request.body.pwd);
  var wordArray = CryptoJS.enc.Utf8.parse(request.body.pwd);
  var base64 = CryptoJS.enc.Base64.stringify(wordArray);
  console.log('encrypted:', base64);
  var qstring = "update user set password='"+base64+ "' where user_id=4";
connection.query(qstring , function (err, result) {
if (err) {
console.log(err.message); 
response.send(err) ;
} else {
console.log("changed Password successfully");
}
});
};