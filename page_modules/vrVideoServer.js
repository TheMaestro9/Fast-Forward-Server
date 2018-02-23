
function addRating(connection, response, videos, index, callback) {

  var videoID = videos[index].video_id;
  var qstring = "select avg(rate) from vr_rating where vr_video_id =" + videoID;
  console.log(qstring);
  connection.query(qstring, function (err, result) {
    if (err) {
      console.log(err);
      // response.status(500).send(err);
    } else {
      addParts(connection, videos[index], function (parts) {

        videos[index]["parts"] = parts;
        if (result[0]["avg(rate)"] == null)
          result[0]["avg(rate)"] = 5;
        videos[index]["avg_rating"] = result[0]["avg(rate)"];
        callback(videos);

      })

    }

  });


}

function addParts(connection, video, callback) {

  var videoId = video.video_id;
  var lq = video.low_quality_url;
  var hq = video.high_quality_url;

  var qstring = "select * from vr_video_parts  where vr_video_id =" + videoId + " order by part_index ";
  console.log(qstring);
  connection.query(qstring, function (err, result) {
    if (err) {
      console.log(err);
      //  response.status(500).send(err);
    } else {
      var FullVideo = {
        "vr_video_id": videoId,
        "high_quality_url": hq,
        "low_quality_url": lq,
        "part_name": "Full Video"
      }
      result.push(FullVideo);
      callback(result);
    }

  });

}
function checkLocked(connection, response, videos, userId, callback) {

  var qstring = "select vr_video_id, unlock_date from unlocked_videos where user_id=" + userId
    + " order by vr_video_id";

  console.log(qstring);

  connection.query(qstring, function (err, result) {
    if (err) {
      console.log(err);
      response.status(500).send(err);
    } else {

      var i = 0, j = 0;
      while (i < videos.length && j < result.length) {
        while (result[j].vr_video_id < videos[i].video_id) {
          j++;
          if (j == result.length)
            break;
        }
        if (j == result.length)
          break;
        if (result[j].vr_video_id == videos[i].video_id) {
          console.log("from data base", result[j].unlock_date);
          if (checkDuration(videos[i], new Date(result[j].unlock_date))) {
            videos[i]["locked"] = false;
            videos[i]["unlock_date"] = result[j].unlock_date;
          }
          else {
            removeUnlock(connection, userId, videos[i].video_id, result[j].unlock_date);
            videos[i]["locked"] = true;
          }
        }

        else
          videos[i]["locked"] = true;

        i++;
      }

      while (i < videos.length)
        videos[i++]["locked"] = true;

      callback(videos);
    }

  });
}

function checkDuration(video, unlockDate) {

  var duration = video.duration;
  var currentDate = new Date();
  unlockDate.setHours(unlockDate.getHours());
  console.log("hello check duration date before", unlockDate);
  console.log("hello check duration current", currentDate);
  unlockDate.setMinutes(unlockDate.getMinutes() + duration);
  console.log("hello check duration date", unlockDate);

  if (currentDate > unlockDate)
    return false;
  else
    return true;

}

function removeUnlock(connection, userId, vrVideoId, unlockDate) {



  var qstring = "delete from unlocked_videos where user_id=" + userId +
    " and vr_video_id =" + vrVideoId;
  console.log(qstring);
  connection.query(qstring, function (err, result) {
    if (err)
      console.log(err)
  });

  unlockDate = unlockDate.toISOString().replace("T", " ").replace("Z", "");
  unlockDate = JSON.stringify(unlockDate); 
  qstring = "insert into unlocked_videos_history  (user_id , vr_video_id , unlock_date ) values ("
    + userId + " , " + vrVideoId + " , " + unlockDate + " ); ";

    console.log("query to add history",qstring);
  connection.query(qstring, function (err, result) {
    if (err)
      console.log(err)
  });
}

exports.getVrVideos = function (connection, response, userId) {


  var qstring = "select * from vr_video order by video_id";

  connection.query(qstring, function (err, result) {
    if (err) {
      console.log(err);
      response.status(500).send(err);
    } else {
      var counter = 0;
      for (i = 0; i < result.length; i++) {
        addRating(connection, response, result, i, function (resultWithRating) {
          result = resultWithRating;
          counter += 1;
          if (counter === result.length) {

            checkLocked(connection, response, result, userId, function (resultWithLocks) {

              var toSend = {
                "trailer_url": "http://fastforwardsim.com/VR/TRAILERLQ.MP4",
                "trailer_pic": "http://www.fastforwardsim.com/alpha/Trailer.png",
                "videos": resultWithLocks

              }
              response.send(toSend);

            })
          }
        });
      }
    }
  });
}

function getCurrentDate() {
  var currentDate = new Date();
  currentDate.setHours(currentDate.getHours());
  currentDate = currentDate.toISOString().replace("T", " ").replace("Z", "");
  currentDate = JSON.stringify(currentDate);
  return currentDate;
}
function insertUnlock(connection, userId, vrVideoId, callback) {

  var currentDate = getCurrentDate();
  var qstring = "insert into unlocked_videos  (user_id , vr_video_id , unlock_date ) values ("
    + userId + " , " + vrVideoId + " , " + currentDate + " ); ";

  console.log(qstring);
  connection.query(qstring, function (err, result) {
    if (err) {
      console.log("error while adding unlock")
      console.log(err);
      callback(false);
    }
    else
      callback(true);
  });
}

function updateWallet(connection, userId, callback) {
  var qstring = "update user set wallet = wallet-1 where user_id =" + userId
    + " and wallet > 0";

  console.log(qstring);
  connection.query(qstring, function (err, result) {
    if (err) {
      console.log("error while updating wallet");
      console.log(err);
      callback(false);
    }
    else {
      if (result.affectedRows > 0)
        callback(true);
      else
        callback(false);
    }
  });
}


function undoUpdateWallet(connection, userId, callback) {
  var qstring = "update user set wallet = wallet+1 where user_id =" + userId;

  console.log(qstring);
  connection.query(qstring, function (err, result) {
    if (err) {
      console.log("error while updating wallet");
      console.log(err);
    }

  });
}

exports.UnlockVideo = function (connection, response, userId, vrVideoId) {
  var toSend = {
    success: true,
    msg: ""
  }
  updateWallet(connection, userId, function (walletSuccess) {
    if (walletSuccess) {
      insertUnlock(connection, userId, vrVideoId, function (insertSuccess) {
        if (insertSuccess)
          response.send(toSend);
        else {
          undoUpdateWallet(connection, userId)
          toSend.success = false;
          toSend.msg = "couldn't unlock this video"
          response.send(toSend)
        }
      });
    }
    else {
      toSend.success = false;
      toSend.msg = "<p>you don't have any unlocks.</p>" +
        "<p> You can get more unlocks from your profile by going premium.</p>"
      response.send(toSend)
    }
  });
}


exports.getUserInfo = function (connection, response, userId) {

  var qstring = "select wallet from user where user_id=" + userId;

  connection.query(qstring, function (err, result) {
    if (err) {
      console.log(err);
      response.status(500).send(err);
    } else {

      response.send(result[0]);
    }

  });
}


exports.getPackages = function (connection, response, userId) {

  var qstring = "select * from packages ";

  connection.query(qstring, function (err, result) {
    if (err) {
      console.log(err);
      response.status(500).send(err);
    } else {

      response.send(result);
    }

  });
}



exports.getNameFromMail = function (connection, response, userEmail) {

  userEmail = JSON.stringify(userEmail);
  var qstring = "select user_id ,user_name from user where user_email= " + userEmail;

  connection.query(qstring, function (err, result) {
    if (err) {
      console.log(err);
      response.status(500).send(err);
    } else {
      response.send(result[0]);
    }

  });
}

exports.addToUserWallet = function (connection, response, userId, wallet) {

  var qstring = "update user set wallet = wallet +" + wallet + " where user_id = " + userId;

  var toSend = {
    success: true,
    msg: ""
  }

  connection.query(qstring, function (err, result) {
    if (err) {
      console.log(err);
      toSend.msg = "error while updating the wallet";
      toSend.success = false;
      response.send(toSend);
    } else {
      response.send(toSend);
    }

  });
}



exports.RateVrVideo = function (connection, response, userId, rate, vrVideoId) {

  var qstring = "insert into vr_rating ( user_id , vr_video_id , rate ) values " +
    " ( " + userId + " , " + vrVideoId + " , " + rate + "); "

  var toSend = {
    success: true,
    msg: ""
  }
  console.log("first query in rating:", qstring);
  connection.query(qstring, function (err, result) {
    if (err) {
      if (err.message.match("Duplicate")) {
        qstring = "update vr_rating set rate = " + rate + " where user_id=" + userId + " and vr_video_id=" + vrVideoId;
        console.log("second query in rating:", qstring);

        connection.query(qstring, function (err2, result) {
          if (err2) {
            console.log(err);
            toSend.msg = "error while Rating";
            toSend.success = false;
            response.send(toSend);
          } else
            response.send(toSend);

        });
      }
      else {
        console.log(err);
        toSend.msg = "error while Rating";
        toSend.success = false;
        response.send(toSend);
      }
    } else {
      response.send(toSend);
    }

  });
}