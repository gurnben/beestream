const mongoose = require('mongoose');
const VideoFile = mongoose.model('VideoFile');
const AverageTrafficByHour = mongoose.model('AverageTrafficByHour');
const AverageTrafficByDay = mongoose.model('AverageTrafficByDay');
const config = require('../../config/config');

module.exports = function(io, socket) {

  socket.on('getData', (message) => {
    console.log(`getData recieved with message ${JSON.stringify(message)}`);
    //Get a count of days with analysis in order to determine how many points to
    //show per day!
    AverageTrafficByDay.countDocuments({HiveName: {"$in": message.hives}},
      (err, documentCount) => {
      if (err) {
        console.log(`Error getting item count: ${err}`);
      }
      else {
        let videosPerDay = Math.floor( message.count / documentCount );
        console.log(videosPerDay);

        //If we can show 2 or less videos per day, show only a daily average
        if (videosPerDay <= 2) {
          for (hive of message.hives) {
            AverageTrafficByDay.find({
              HiveName: hive
            }, {
              _id: 0,
              HiveName: 1,
              AverageArrivals: 1,
              AverageDepartures: 1,
              UTCDate: 1
            }).lean().exec(
            (err, data) => {
                if (err) {
                  console.log(`Error retrieving data: ${err}`);
                }
                else {
                  let hivename = hive;
                  let arrivals = [];
                  let departures = [];
                  let dates = [];
                  let response = data.map((analysis, index) => {
                      arrivals[index] = analysis.AverageArrivals;
                      departures[index] = analysis.AverageDepartures;
                      dates[index] = new Date(analysis.UTCDate);
                    }
                  );
                  console.log('Results Averaged Daily');
                  console.log(arrivals.slice(0, 5));
                  console.log(departures.slice(0, 5));
                  console.log(dates.slice(0, 5));
                  console.log(data.slice(0, 5));
                  //TODO: Use this data to respond in a formatted way with all other conditionals - write a helper to do so!
                }
            });
          }
        }
        //If we can show 2-4 videos per day, show an average of every other hour
        else if (videosPerDay <= 4) {
          AverageTrafficByHour.aggregate([
            {
                "$match" : {
                    "HiveName" : {"$in": message.hives}
                }
            },
            {
                "$addFields" : {
                    "hourBin" : {
                        "$floor" : {
                            "$divide" : [
                                "$UTCHour",
                                2.0
                            ]
                        }
                    }
                }
            },
            {
                "$group" : {
                    "_id" : {
                        "hive" : "$HiveName",
                        "year" : "$UTCYear",
                        "month" : "$UTCMonth",
                        "day" : "$UTCDay",
                        "hourBin" : "$hourBin"
                    },
                    "AverageArrivals" : {
                        "$avg" : "$AverageArrivals"
                    },
                    "AverageDepartures" : {
                        "$avg" : "$AverageDepartures"
                    },
                    "HiveName" : {
                        "$first" : "$HiveName"
                    },
                    "UTCYear" : {
                        "$first" : "$UTCYear"
                    },
                    "UTCMonth" : {
                        "$first" : "$UTCMonth"
                    },
                    "UTCDay" : {
                        "$first" : "$UTCDay"
                    },
                    "HourBin" : {
                        "$first" : "$hourBin"
                    }
                }
            }
          ], (err, results) => {
            if (err) {
              console.log(`Error retrieving data averaged bi-hourly: ${err}`);
            }
            else {
              console.log('Results Averaged Bi-Hourly');
              console.log(results);
            }
          })
        }
        //If we can show less than 30 things, show one point for each hour
        else if (videosPerDay <= 30) {
          AverageTrafficByHour.find({
            HiveName: {"$in": message.hives}
          }, {
            _id: 0
          }, (err, results) => {
            if (err) {
              console.log(`Error retrieving data averaged by hour: ${err}`);
            }
            else {
              console.log("Results Averaged by Hour");
              console.log(results);
            }
          });
        }
        //Otherwise, show all points!
        else {
          VideoFile.find({
            HiveName: {"$in": message.hives}
          }, {
            _id: 0
          }, (err, results) => {
            if (err) {
              console.log(`Error retrieving whole data: ${err}`);
            }
            else {
              console.log('Full results');
              console.log(results);
            }
          });
        }
      }
    });
  });

  socket.on('dashboardHiveList', (message) => {
    VideoFile.find({
      ArrivalsTriangle: {$exists: true},
      DeparturesTriangle: {$exists: true}})
      .distinct('HiveName', (err, hives) => {
      if (err) {
        console.log(`Error Retrieving Hive List: ${err}`);
      }
      else {
        hives.sort();
        socket.emit('dashboardHiveList', {hiveNames: hives});
      }
    });
  });
}
