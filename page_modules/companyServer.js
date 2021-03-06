
exports.GetPromoCodeDiscount = function (connection, response  , promoCode, companyID ) {


    str ="select * from company_promo_code where (company_id ="+companyID+" or company_id = 0)" + 
         " and promo_code='"+promoCode+"'" ;  
    console.log(str); 
     connection.query(str , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          
          response.send(result[0]);
          }
           
    });

}

exports.GetCompanyDetails = function (connection ,response ,companyID  ) {
console.log("IN ")
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
                    
                    response.send(toSend)
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
    var currentDate = new Date ().toISOString().replace("T"," ").replace("Z","") 
      // get dates 
    var qstring = "select * from simulation_date where votes = 0 and  simulation_id=" +SimID +" and date > '"+currentDate +"';" ;  
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

getNumberOfApplicants=function  (connection , simulations , index, simID , callback){

var currentDate = new Date ().toISOString().replace("T"," ").replace("Z","") 
currentDate = JSON.stringify(currentDate)
var  qstring =  "select count(*) as count  from simulation , simulation_date , applications "+
                "where simulation.simulation_id = simulation_date.simulation_id and "+  
                "simulation_date.simulation_date_id = applications.simulation_date_id "+
                "and simulation.simulation_id ="+ simID +" and simulation_date.date > "+ currentDate; 

       console.log("the query: "+qstring +"\n"); 
      connection.query(qstring , function (err, result) {
      if (err) {
      // response.status(500).send(err);
        console.log(err,"error in get num of applicants") ; 
      } else { 
        simulations[index]["number_of_applicants"] =result[0].count;  
        callback(simulations) ; 
      }

    });
  
}
function DeleteApplication (connection , userID , simulationID) {
var qstring = "delete from applications where user_id="+userID+ " and simulation_date_id="+simulationID;
  connection.query(qstring , function (err, result) {
  if (err) {
    console.log(err.message); 
  } else {
  console.log("deleted successfully");
  }
  });

}
function getSimulationStatus (connection , simulations , index, simID , userID ,callback){
  var currentDate = new Date().toISOString().replace("T", " ").replace("Z", "") ;
  currentDate = JSON.stringify (currentDate) ; 
  var  qstring =  "select status as status , payment_date , date , "+
                " simulation_date.simulation_date_id from simulation , simulation_date , applications "+
                "where simulation.simulation_id = simulation_date.simulation_id and "+  
                "simulation_date.simulation_date_id = applications.simulation_date_id "+
                "and simulation.simulation_id ="+ simID+" and user_id="+userID+" and date >"+currentDate ; 

       console.log("the query: "+qstring +"\n"); 
      connection.query(qstring , function (err, result) {
      if (err) {
      // response.status(500).send(err);
        console.log(err,"error in get num of applicants") ; 
      } else { 

        if(result.length > 1 )
          simulations[index]["status"] ="Veiw Status";  
        else if (result.length === 1 ){
            currentDate = new Date () ; 
            var AcceptanceDeadline = new Date( result[0].payment_date) ; 
           AcceptanceDeadline .setDate( AcceptanceDeadline.getDate() + 1 ) ; 
            var status = result[0].status;
            if(currentDate > AcceptanceDeadline & status == 'pending payment'){
              status = ""
              DeleteApplication(connection , userID , simID) ; 
            }
            // AcceptanceDeadline .setHours( AcceptanceDeadline.getHours() + 2 ) ; 
            simulations[index]["status"] = status ; 
            simulations[index]["acceptance_deadline"]= AcceptanceDeadline ; 
            simulations[index]["applied_simulation_date"]= result[0].date ; 
            simulations[index]["applied_simulation_date_id"]= result[0].simulation_date_id ; 
            
        }

        else {
          simulations[index]["status"] ="";  
          simulations[index]["Acceptance_deadline"]= "" ;
        }

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

exports.checkUserFollowCompany=function ( connection , response , CompanyID  , UserID ){
  var toSend={};
  var qstring = "select * from user_follow_company where "+
                "user_id = " +UserID+ " and company_id = "+CompanyID+ ";" ;  
  console.log("the query: "+qstring +"\n"); 
  connection.query(qstring , function (err, result) {
    if (err) {
      console.log(err);
     response.status(500).send(err);
    } else {

  console.log("result",result.length);

                 if (result.length>0)
                   toSend["followed"] = true ; 
                  else 
                    toSend["followed"] = false ; 
                    console.log("result",toSend["followed"]);
                     
            response.send(toSend);
            }

          



     
    
    });

  };



