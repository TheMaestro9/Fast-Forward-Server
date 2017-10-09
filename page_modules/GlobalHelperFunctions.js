function getMonthName (monthNumber){

  switch(monthNumber){

    case 0 : 
      return "January" ; 
     // break ; 
    case 1 : 
      return "February" ;
    case 2 : 
      return "March"  ; 
    case 3 : 
      return "April"  ; 
    case 4 : 
      return "May" ;
    case 5 : 
      return "June"  ; 
    case 6 : 
      return "July" ;
    case 7 : 
      return "August"  ; 
    case 8 : 
      return "September" ;
    case 9 : 
      return "October"  ; 
    case 10 : 
      return "November" ;
    case 11 : 
      return "December"  ; 

  }
}
exports.TransfromDate= function  (date)
{

  //svar dd = new Date () ; 
  //dd.getMonth ; 
  var send ; 
    if(date.getHours()==2)
    {
      send =getMonthName(date.getMonth() );
       
      console.log ("month" , send) ; 
    }
    else { 
      var datos = date.toDateString() ;
      var time = date.getHours() ; 
      var Label = " AM"; 
      if (time > 12 ){
        time = time - 12 ; 
        Label =" PM"; 
      }
      //console.log(time); 
      send = datos +" at " + time +""+Label ; 
    }
    return send ; 
   // console.log(send); 
}


exports.SendAnEmail= function  (email , password ){

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport'); 
var transporter = nodemailer.createTransport(smtpTransport({
                                  service: 'Hotmail',
                                  auth: {
                                    user: 'fastforwardsim@outlook.com', // Your email id
                                    pass: 'Fastforward$$' // Your password
                                  }
                                }));

                                var mailOptions = {
                                  from: 'fastforwardsim@outlook.com', // sender address
                                  to: email, // list of receivers
                                  subject: 'Change Password', // Subject line
                                  //text: text //, // plaintext body
                                  html: "Your password is "+password// You can choose to send an HTML body instead
                                };
                                transporter.sendMail(mailOptions, function(error, info){
                                  if(error){
                                    //globalCTRL.addErrorLog(error);
                                   // res.send(error.message);
                                   console.log("email sending problem"+ error.message); 
                                  }else{
                                    console.log(123);
                                    //res.send({'ok':info.response});
                                  };
                                });
}

 exports.FollowCompany  = function (connection , response  , userID , companyID) { 


 var qstring = "INSERT INTO user_follow_company VALUES("+userID+","+companyID+");";  
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {

        response.send(result); 
      }

    });

 }

 exports.UnFollowCompany  = function (connection , response  , userID , companyID) { 

    var qstring ="DELETE FROM user_follow_company where "+
                 "user_id ="+userID+" and company_id = " +companyID+ ";" ;   
    console.log("the query: "+qstring +"\n"); 
    connection.query(qstring , function (err, result) {
      if (err) {
        console.log(err);
       response.status(500).send(err);
      } else {

        response.send(result); 
      }
    });
   
 }