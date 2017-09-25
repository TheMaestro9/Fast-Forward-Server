exports.CheckVersion = function (connection , version , response ) {

    var toSend = {
      "result" : false 
    }
    str = "select * from appDetails where appKey = 'version' " ; 
     connection.query(str , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {
          console.log(result) ; 
          console.log(result[0].appValue) ; 
          var NeededVersion = parseInt(result[0].appValue) ; 
          console.log(NeededVersion);
          if ( version > NeededVersion ){
          toSend.result = true ; 
          response.send(toSend);
          }
            else
             response.send(toSend); 
        }

    });

}