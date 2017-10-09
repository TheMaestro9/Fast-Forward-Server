
exports.GetPromoCodeDiscount = function (connection, response  , promoCode, companyID ) {


    str ="select * from company_promo_code where (company_id ="+companyID+" or company_id = 0)" + 
         " and promo_code='"+promoCode+"'" ;  
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

exports.GetCompanyDetails = function (connection ,response ,companyID   ) {

    var toSend = {} ; 
    // execute a query on our database
    var qstring = "select * from company where company_id ="+companyID +";" ;  
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          qstring= "select COUNT(*) from user_follow_company   WHERE company_id =" +companyID +";" ;  
              connection.query(qstring , function (err, result2) {
                if (err) {
                  console.log(err);
                response.status(500).send(err);
                } else {
                    console.log(result2[0]["COUNT(*)"]); 
                    toSend["followers"] =result2[0]["COUNT(*)"] ; 
                    toSend = Object.assign (result[0] , toSend); 
                    response.send (toSend);  
                }

            });
      }
    });
}
 
exports.GetCompanySimulations  = function (connection , response , companyID , userID) { 

    var qstring = "select * from simulation where company_id=" +companyID+ ";";
                 
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
        var counter = 0 ; 
       for (i = 0  ; i < result.length ; i++){
          
         getSimDetails(connection , result, i ,userID,  function (ResutWithDates){
            result = ResutWithDates ; 
            counter += 1 ; 
            if (counter === result.length)
               response.send (result) ;
         });
       }
       
      }

    });
}



function getSimDetails (connection , simulations , index , userID,   callback ){
    var SimID = simulations[index].simulation_id ; 
      // get dates 
    var qstring = "select * from simulation_date where votes = 0 and  simulation_id=" +SimID +";" ;  
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
      // response.status(500).send(err);
      console.log("error in get dates") ; 
    } else {
        var Dates = [] ;
        
        for (i = 0 ; i< result.length ; i++){
          var temp = {
          "date_id":"" , 
          "date":""  
        } ; 

           var GHF = require ("./GlobalHelperFunctions") ; 
           temp.date_id = result[i].simulation_date_id ;
           temp.date = GHF.TransfromDate( result[i].date) ;
           Dates.push(temp) ; 
           console.log(result[i]) ;
        }
        //console.log("done ya maw");
        simulations[index]["dates"] =Dates; 

        getNumberOfApplicants(connection , simulations , index ,SimID, function(TheSim){
              getSimulationStatus(connection , TheSim , index ,SimID , userID , function(TheFinalSim){
                            callback(TheFinalSim) ; 
              });

        }) ;
      }

    });
  
  

}

function getNumberOfApplicants (connection , simulations , index, simID , callback){

var  qstring =  "select count(*) as count  from simulation , simulation_date , applications "+
                "where simulation.simulation_id = simulation_date.simulation_id and "+  
                "simulation_date.simulation_date_id = applications.simulation_date_id "+
                "and simulation.simulation_id ="+ simID ; 

       console.log("the query: "+qstring +"\n"); 
      connection.query(qstring , function (err, result) {
      if (err) {
      // response.status(500).send(err);
        console.log("error in get num of applicants") ; 
      } else { 
        simulations[index]["number_of_applicants"] =result[0].count;  
        callback(simulations) ; 
      }

    });
  
}

function getSimulationStatus (connection , simulations , index, simID , userID ,callback){

  var  qstring =  "select status as status  from simulation , simulation_date , applications "+
                "where simulation.simulation_id = simulation_date.simulation_id and "+  
                "simulation_date.simulation_date_id = applications.simulation_date_id "+
                "and simulation.simulation_id ="+ simID+" and user_id="+userID ; 

       console.log("the query: "+qstring +"\n"); 
      connection.query(qstring , function (err, result) {
      if (err) {
      // response.status(500).send(err);
        console.log("error in get num of applicants") ; 
      } else { 
        if(result.length > 1 )
          simulations[index]["status"] ="Veiw Status";  
        else if (result.length === 1 )
          simulations[index]["status"] =result[0].status;  
        else 
          simulations[index]["status"] ="";  

        callback(simulations) ; 
      }

    });
  
}
exports.apply = function (connection , response , simulationDateID , userID){
 var toSend =  {
      "result": "pending approval" 
    } ; 
    var qstring = "INSERT INTO applications (user_id , simulation_date_id , status) "+
    "VALUES("+userID+","+simulationDateID+",'pending approval');";  
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {

        response.send(toSend); 
      }

    });
}
