exports.GetUserInfo  = function (connection , response  , userID) { 


 qstring = "select * from user where user_id="+ userID + ";" ; 
    console.log(qstring); 
    connection.query(qstring ,  function (err, result , field ) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          response.send(result[0]) ;
        }
  });
}

exports.GetUserSimulations  = function (connection , response  , userID) { 

qstring = " select simulation_date.simulation_date_id, company_name, profile_pic_link,simulation_name , date , status , price ,payment_date from company, simulation , simulation_date , applications"+
              " where user_id="+ userID + 
              " and simulation_date.simulation_id = simulation.simulation_id and company.company_id = simulation.company_id "+
              " and applications.simulation_date_id = simulation_date.simulation_date_id;" ; 
    console.log(qstring); 
    connection.query(qstring ,  function (err, result , field ) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          for ( i = 0 ; i < result.length ; i++){

             var GHF = require("./GlobalHelperFunctions") ;
             result[i].date = GHF.TransfromDate( result[i].date)  ;
             if ( result[i].status == "pending payment"){
                var AcceptanceDeadline = new Date( result[i].payment_date) ; 
                AcceptanceDeadline .setDate( AcceptanceDeadline.getDate() + 1 ) ; 
                // AcceptanceDeadline .setHours( AcceptanceDeadline.getHours() + 2 ) ; 
                result[i]["acceptance_deadline"] = AcceptanceDeadline ; 
             }
          }
          
          response.send(result) ;
        }
  });

}
exports.EditUser = function (connection , response  , userName 
, degree ,user_email , school , phone_no  , userID) { 

   var toSend = {
        "result" : false , 
      //  "name": "",
        "msg" : ""}
    var qstring = "UPDATE  user SET user_name ='"+ userName+ 
                                   "', degree = '"+degree+
                                   "', user_email='"+user_email+ 
                                   "', school ='"+school+
                                   "', phone_no='"+phone_no+
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
                  //toSend.name= UserName ; 
                  response.send(toSend) ;
                }

        
    });

}

exports.DeleteUserSimulation =  function (connection , response , userID , simulationID){
  var qstring = "delete from applications where user_id="+userID+ " and simulation_date_id="+simulationID;
  connection.query(qstring , function (err, result) {
  if (err) {
    console.log(err.message); 
    response.send(err) ;
  } else {
  console.log("deleted successfully");
  response.send("deleted") ; 
  }
  });
} 