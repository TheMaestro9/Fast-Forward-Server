
exports.GetAllVideos = function (connection, response, UserID) {

  var qstring = "select company_video.video_id, company.company_id, company_name , video_or_not, " +
    "video_link , company_video.description , likes , profile_pic_link" +
    " from company_video , company where company.company_id = company_video.company_id " +
    "order by video_id desc ;";
  console.log("the query: " + qstring + "\n");

  // var sync = Futures.sequence;
  connection.query(qstring, function (err, result) {
    if (err) {
      console.log(err);
      response.status(500).send(err);
    } else {
      var counter = 0;
      for (i = 0; i < result.length; i++) {
        checkUserFollowLikeCompany(connection, response, result, i, UserID, function (resultWithfollow) {
          result = resultWithfollow;
          counter += 1;
          if (counter === result.length) {
            console.log(result);
            response.send(result);
          }
        });


      }

    }

  });
}


function checkUserFollowLikeCompany(connection, response, Videos, index, UserID, callback) {
  var CompanyID = Videos[index].company_id;
  var VideoID = Videos[index].video_id;
  var qstring = "select * from user_follow_company where " +
    "user_id = " + UserID + " and company_id = " + CompanyID + ";";
  console.log("the query: " + qstring + "\n");
  connection.query(qstring, function (err, result) {
    if (err) {
      console.log(err);
      response.status(500).send(err);
    } else {

      var qstring = "select * from user_like_video where " +
        "user_id = " + UserID + " and video_id = " + VideoID + ";";
      console.log("the query: " + qstring + "\n");
      connection.query(qstring, function (err, result2) {
        if (err) {
          console.log(err);
          response.status(500).send(err);
        } else {
          if (result2.length > 0)
            Videos[index]["liked"] = true;
          else
            Videos[index]["liked"] = false;

          if (result.length > 0)
            Videos[index]["followed"] = true;
          else
            Videos[index]["followed"] = false;

          callback(Videos);

        }

      });





    }

  });
}

exports.LikeVideo = function (connection, response, userID, videoID) {

  var qstring = "INSERT INTO user_like_video VALUES(" + userID + "," + videoID + ");";
  console.log("the query: " + qstring + "\n");
  connection.query(qstring, function (err, result) {
    if (err) {
      console.log(err);
      response.status(500).send(err);
    } else {

      var qstring = "UPDATE company_video SET likes = likes+1 where video_id=" + videoID + ";";
      connection.query(qstring, function (err, result2) {
        if (err) {
          console.log(err);
          response.status(500).send(err);
        } else {


          response.send(result);
        }

      });
    }

  });

}

exports.DisLikeVideo = function (connection, response, userID, videoID) {


  var qstring = "DELETE FROM user_like_video where " +
    "user_id =" + userID + " and video_id = " + videoID + ";";
  console.log("the query: " + qstring + "\n");
  connection.query(qstring, function (err, result) {
    if (err) {
      console.log(err);
      response.status(500).send(err);
    } else {

      var qstring = "UPDATE company_video SET likes = likes-1 where video_id=" + videoID + ";";
      connection.query(qstring, function (err, result2) {
        if (err) {
          console.log(err);
          response.status(500).send(err);
        } else {


          response.send(result);
        }

      });
    }

  });
}

exports.AddVideo = function (connection, response, companyID, description, videoLink, videoOrNot) {

  videoLink = videoLink.replace("watch?v=", "embed/");

  var qstring = "INSERT INTO company_video (company_id , video_link , description, video_or_not) " +
    "VALUES(" + companyID + ",\"" + videoLink + "\",\"" + description + "\", " + videoOrNot + ");";
  console.log("the query: " + qstring + "\n");
  connection.query(qstring, function (err, result) {
    if (err) {
      console.log(err);
      response.status(500).send(err);
    } else {

      response.send(result);
    }

  });

}