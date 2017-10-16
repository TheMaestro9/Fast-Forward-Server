exports.AddSimulationDate  = function (connection,  response , date , simID ){
    // first check that the date doesn't exist before. 
    var toSend = { 
    "result": true , 
    "msg": "Date was inserted successfully" 
    }
    checkSimDateExist (connection , date , simID , function (simDateID){
        if (simDateID.length=== 0 ) // if it don't exist insert it 
        {
              var qstring = "INSERT INTO simulation_date ( simulation_id  , date , votes )" + 
                              "VALUES (" +simID+ " , '"+date+"', 0);" ;   
              console.log("the query: "+qstring +"\n"); 
              connection.query(qstring , function (err, result) {
                if (err) {
                  console.log(err);
                //response.status(500).send(err);
              }
              else 
                console.log("date inserted successfully"); 
                response.send(toSend) ; 
              });                 
            
        }

      else {
        toSend.result = false ; 
        toSend.msg = "This Date already Exist!" ; 
        response.send(toSend);  
       // console.log("date already exist")
      }
    }); 
     
}



function checkSimDateExist (connection ,  date , simID , callback){

var qstring ="select simulation_date_id from simulation_date where "+
                 "simulation_id ="+simID+" and date = '"+date+"';" ; 
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