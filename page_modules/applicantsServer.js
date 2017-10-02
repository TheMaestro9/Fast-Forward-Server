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
            if (result[i].status==="accepted")
              toSend.accepted.push(result[i])
            else
              toSend.applied.push(result[i])

          }
          response.send(toSend);
          }
           
    });
 }