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
