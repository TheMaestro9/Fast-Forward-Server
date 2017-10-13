 exports.GetApplicants  = function (connection , response , simDateID ) { 
 var toSend = {
      "accepted" : [] , 
      "applied" : []  
    }


    str = "select user_name , rating , degree , major , user.user_id , status from user , applications where " + 
          " applications.user_id = user.user_id and simulation_date_id= " +simDateID ; 
    console.log(str); 
     connection.query(str , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          for(i = 0 ; i < result.length ; i++)
          {
            if (result[i].status==="accepted"){
              toSend.accepted.push(result[i])
            
            }
              
            else
              toSend.applied.push(result[i])

          }
          response.send(toSend);
          }
           
    });
 }


  exports.AcceptApplicant  = function (connection , response , price , userID , simDateId ) { 

    var stat = ""  ; 
    if (price === 0){
      stat = "accepted" ; 
      email = "select user_email from user where user_id ="+userID; 
       connection.query(email , function (err, result) {
        if (err) {
          console.log(err);
         response.status(500).send(err);
        } else {
          GHF = require("./GlobalHelperFunctions") ; 
          GHF.SendAnEmail(result[0].user_email ,'Acceptance Notification',"Congratulations you got accepted in the simulation.") ; 
          // response.send(result);
            }
             
      });
    }
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
    
  }



  exports.RejectApplicant  = function (connection , response  , userID , simDateId ) { 

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
    
  }