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
          GHF.SendAnEmail(UserEmail ,'Change Password',"Your password is "+result[0].password) ; 
          toSend.result= true ;
          toSend.msg  = "An Email Has Been Sent To You With your Password Check It Out!" ;
          response.send (toSend);  
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

