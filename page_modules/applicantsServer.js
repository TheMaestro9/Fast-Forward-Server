 exports.GetApplicants  = function (connection , response , simDateID ) { 
 var toSend = {
      "accepted" : [] , 
      "applied" : [] ,
      "pending" : []
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
            else if(result[i].status==="pending payment"){
              toSend.pending.push(result[i])
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
      stat = "pending payment" ; 
      email = "select user_email from user where user_id ="+userID; 
       connection.query(email , function (err, result) {
        if (err) {
          console.log(err);
         response.status(500).send(err);
        } else {
          simulationName="select s.simulation_name from simulation s JOIN simulation_date sd ON sd.simulation_date_id ="+simDateId;
          connection.query(simulationName,function(err,res){
            if (err) {
              console.log(err);
             response.status(500).send(err);
            } else {
              GHF = require("./GlobalHelperFunctions") ; 
               GHF.SendAnEmail(result[0].user_email ,'Acceptance Notification',"Congratulations, you got accepted in the "+res[0].simulation_name+" simulation."+
              "You should now pay a reservation fee to be refunded at the begining of the simulation. You can check the payment methods in the mobile App now.") ; 
            }})
          
          // response.send(result);
            }
             
      });
    }
    else{
      stat = "pending payment"; 
      email = "select user_email from user where user_id ="+userID; 
      connection.query(email , function (err, result) {
       if (err) {
         console.log(err);
        response.status(500).send(err);
       } else {
         simulationName="select s.simulation_name from simulation s JOIN simulation_date sd ON sd.simulation_date_id ="+simDateId;
         connection.query(simulationName,function(err,res){
           if (err) {
             console.log(err);
            response.status(500).send(err);
           } else {
            console.log("in accept applicants the first result" , result) ; 
            console.log("in accept applicants the second res" , res) ; 
            GHF = require("./GlobalHelperFunctions") ; 
            GHF.SendAnEmail(result[0].user_email ,'Payment Notification',"Kindly, you are requested to pay "+price+"L.E for the "+res[0].simulation_name+" simulation.") ; 
           }})
         
         // response.send(result);
           }
            
     });
    }
      

     var AcceptanceDate = new Date ().toISOString().replace("T"," ").replace("Z","") ;
   //  AcceptanceDate.setHours(AcceptanceDate.getHours() + 2)  ; 
    // AcceptanceDate = AcceptanceDate.toISOString().replace("T"," ").replace("Z","") ;
      str = "update applications set status = '"+stat+"' , payment_date='"+ AcceptanceDate +"'  where user_id ="+userID+" and simulation_date_id = "+simDateId ; 
    //console.log(str); 
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
      // console.log(str); 
       connection.query(str , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          
          response.send(result);
          }
           
     });
    
  }