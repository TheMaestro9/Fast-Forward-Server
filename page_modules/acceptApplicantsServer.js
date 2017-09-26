 exports.GetCompanySimulations = function (connection , response , companyID){

    var qstring = "select * from simulation_date , simulation where company_id=" +companyID +
                    " and simulation_date.simulation_id = simulation.simulation_id and votes = 0" ;  
        console.log("the query: "+qstring +"\n"); 
        connection.query(qstring , function (err, result) {
        if (err) {
            console.log(err);
        response.status(500).send(err);
        } else {

            var counter = 0 ; 
        for (i = 0  ; i < result.length ; i++){
            
            getSimApplicants(connection , result, i , function (ResutWithAppNum){
                result = ResutWithAppNum ; 
                counter += 1 ; 
                if (counter === result.length)
                response.send (result) ;
            });
        }
        //  response.send(result) ; 
        }

        });
}
function getSimApplicants (connection, simulations , index , callback){



var qstring = "select count(*) as count from applications where simulation_date_id =" +simulations[index].simulation_date_id  ; 
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          var GHF = require ("./GlobalHelperFunctions") ; 
          simulations[index]["applicants_no"] = result[0].count ; 
          simulations[index].date= GHF.TransfromDate( simulations[index].date ) ; 
          callback (simulations) ; 
      }



    });

}
 
 