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
