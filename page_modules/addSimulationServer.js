exports.DeleteSimulation  = function (connection , response ,simulationID) { 

     var qstring = "Delete from simulation where simulation_id = "+simulationID ; 
                console.log("the query: "+qstring +"\n"); 
                connection.query(qstring , function (err, result) {
                    if (err) {
                    console.log(err);
                    response.status(500).send(err);
                    } else {
                    //response.send(result) ; 
                    response.send(result) ; 
                    }
                }); 

}

exports.EditSimulation = function (connection , response  , simID , 
Name , Description , price , field  ) {

    var qstring = "UPDATE  simulation SET simulation_name =\""+ Name+ 
                                   "\", description = \""+Description+
                                     "\", price = "+price+
                                       ", field_id = "+field+
                                   " where simulation_id ="+simID;  
    console.log("the query: "+qstring +"\n"); 
     connection.query(qstring , function (err, result) {
                  if (err) {
                    console.log(err.message); 
                      response.send(err); 
                    
                } else {
                  response.send(result) ;
                }

        
    });




}



