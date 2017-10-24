exports.EditCompany = function (connection , response  , companyID , 
Name , Description ) {

    var qstring = "UPDATE  company SET company_name ='"+ Name+ 
                                   "', description = '"+Description+
                                   "' where company_id ="+companyID;  
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
