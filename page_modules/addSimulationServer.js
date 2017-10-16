
exports.AddSimulation  = function (connection , response , companyID  ,fieldID
                                    , name ,price , description ) { 
        var toSend = {
            "result" : true , 
            "msg": "Simulation Added successfully" 
            }

        checkSimExist(connection, companyID, fieldID, name , price , function (simID) {
            if (simID.length != 0 )
            {
                toSend.result = false ; 
                toSend.msg = "this simulation already exist !"
                response.send(toSend); 
            }
            else 
            {
                    var qstring = "INSERT INTO simulation ( simulation_name , company_id  ,  field_id , price , description )" + 
                        "VALUES ( '"+name+"'," +companyID+ ","+ fieldID+" , "+ price+ ",'"+description+"');" ;   
                console.log("the query: "+qstring +"\n"); 
                connection.query(qstring , function (err, result) {
                    if (err) {
                    console.log(err);
                    response.status(500).send(err);
                    } else {
                    //response.send(result) ; 
                    response.send(toSend) ; 
                    }
                }); 
            }
        }); 
  }


  function checkSimExist (connection , companyID, fieldID , name ,price , callback) 
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