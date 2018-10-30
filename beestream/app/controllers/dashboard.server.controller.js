const mongoose = require('mongoose');
const VideoFile = mongoose.model('VideoFile');
const AverageTrafficByHour = mongoose.model('AverageTrafficByHour');
const AverageTrafficBiHourly = mongoose.model('AverageTrafficBiHourly');
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
        // let videosPerDay = Math.floor( message.count / documentCount );
        let videosPerDay = 61
        console.log(videosPerDay);

        //If we can show 2 or less videos per day, show only a daily average
        if (videosPerDay <= 2) {
          for (var hive of message.hives) {
            AverageTrafficByDay.find({
              HiveName: hive
            }, {
              _id: 0,
              HiveName: 1,
              AverageArrivals: 1,
              AverageDepartures: 1,
              MinimumArrivals: 1,
              MinimumDepartures: 1,
              MaximumArrivals: 1,
              MaximumDepartures: 1,
              UTCStartDate: 1,
              UTCEndDate: 1
            }, (err, data) => {
                if (err) {
                  console.log(`Error retrieving data: ${err}`);
                }
                else {
                  let hivename = hive;
                  let averageArrivals = [];
                  let averageDepartures = [];
                  let minimumArrivals = [];
                  let minimumDepartures = [];
                  let maximumArrivals = [];
                  let maximumDepartures = []
                  let startDates = [];
                  let stopDates = [];
                  let response = data.map((analysis, index) => {
                      averageArrivals[index] = analysis.AverageArrivals;
                      averageDepartures[index] = analysis.AverageDepartures;
                      startDates[index] = new Date(analysis.UTCStartDate);
                      stopDates[index] = new Date(analysis.UTCEndDate);
                      minimumArrivals[index] = analysis.MinimumArrivals;
                      minimumDepartures[index] = analysis.MinimumDepartures;
                      maximumArrivals[index] = analysis.MaximumArrivals;
                      maximumDepartures[index] = analysis.MaximumDepartures;
                    }
                  );
                  console.log('Results Averaged Daily');
                  console.log(averageArrivals.slice(0, 5));
                  console.log(averageDepartures.slice(0, 5));
                  console.log(minimumArrivals.slice(0, 5));
                  console.log(minimumDepartures.slice(0, 5));
                  console.log(maximumArrivals.slice(0, 5));
                  console.log(maximumDepartures.slice(0, 5));
                  console.log(startDates.slice(0, 5));
                  console.log(stopDates.slice(0, 5));
                  console.log(data.slice(0, 5));
                  //TODO: Use this data to respond in a formatted way with all other conditionals - write a helper to do so!
                }
            });
          }
        }
        //If we can show 2-6 videos per day, show an average of every other hour
        else if (videosPerDay <= 6) {
          for (var hive of message.hives) {
            AverageTrafficBiHourly.find({
              HiveName: hive
            }, {
              _id: 0,
              HiveName: 1,
              AverageArrivals: 1,
              AverageDepartures: 1,
              AverageFileSize: 1,
              MinimumArrivals: 1,
              MinimumDepartures: 1,
              MinimumFileSize: 1,
              MaximumArrivals: 1,
              MaximumDepartures: 1,
              MaximumFileSize: 1,
              UTCStartDate: 1,
              UTCEndDate: 1
            }, (err, data) => {
              if (err) {
                console.log(`Error retrieving data averaged bi-hourly: ${err}`);
              }
              else {
                let hivename = hive;
                let averageArrivals = [];
                let averageDepartures = [];
                let averageFileSize = [];
                let minimumArrivals = [];
                let minimumDepartures = [];
                let minimumFileSize = [];
                let maximumArrivals = [];
                let maximumDepartures = [];
                let maximumFileSize = [];
                let startDates = [];
                let stopDates = [];
                let response = data.map((analysis, index) => {
                    averageArrivals[index] = analysis.AverageArrivals;
                    averageDepartures[index] = analysis.AverageDepartures;
                    averageFileSize[index] = analysis.AverageFileSize;
                    startDates[index] = new Date(analysis.UTCStartDate);
                    stopDates[index] = new Date(analysis.UTCEndDate);
                    minimumArrivals[index] = analysis.MinimumArrivals;
                    minimumDepartures[index] = analysis.MinimumDepartures;
                    minimumFileSize[index] = analysis.MinimumFileSize;
                    maximumArrivals[index] = analysis.MaximumArrivals;
                    maximumDepartures[index] = analysis.MaximumDepartures;
                    maximumFileSize[index] = analysis.MaximumFileSize
                  }
                );
                console.log('Results Averaged Bi-Hourly');
                console.log(averageArrivals.slice(0, 5));
                console.log(averageDepartures.slice(0, 5));
                console.log(averageFileSize.slice(0, 5));
                console.log(minimumArrivals.slice(0, 5));
                console.log(minimumDepartures.slice(0, 5));
                console.log(minimumFileSize.slice(0, 5));
                console.log(maximumArrivals.slice(0, 5));
                console.log(maximumDepartures.slice(0, 5));
                console.log(maximumFileSize.slice(0, 5));
                console.log(startDates.slice(0, 5));
                console.log(stopDates.slice(0, 5));
                console.log(data.slice(0, 5));
              }
            });
          }
        }
        //If we can show less than 60 things, show one point for each hour
        else if (videosPerDay <= 60) {
          for (var hive of message.hives) {
            AverageTrafficByHour.find({
              HiveName: hive
            }, {
              _id: 0,
              HiveName: 1,
              AverageArrivals: 1,
              AverageDepartures: 1,
              AverageFileSize: 1,
              MinimumArrivals: 1,
              MinimumDepartures: 1,
              MinimumFileSize: 1,
              MaximumArrivals: 1,
              MaximumDepartures: 1,
              MaximumFileSize: 1,
              UTCStartDate: 1,
              UTCEndDate: 1
            }, (err, data) => {
              if (err) {
                console.log(`Error retrieving data averaged bi-hourly: ${err}`);
              }
              else {
                let hivename = hive;
                let averageArrivals = [];
                let averageDepartures = [];
                let averageFileSize = [];
                let minimumArrivals = [];
                let minimumDepartures = [];
                let minimumFileSize = [];
                let maximumArrivals = [];
                let maximumDepartures = [];
                let maximumFileSize = [];
                let startDates = [];
                let stopDates = [];
                let response = data.map((analysis, index) => {
                    averageArrivals[index] = analysis.AverageArrivals;
                    averageDepartures[index] = analysis.AverageDepartures;
                    averageFileSize[index] = analysis.AverageFileSize;
                    startDates[index] = new Date(analysis.UTCStartDate);
                    stopDates[index] = new Date(analysis.UTCEndDate);
                    minimumArrivals[index] = analysis.MinimumArrivals;
                    minimumDepartures[index] = analysis.MinimumDepartures;
                    minimumFileSize[index] = analysis.MinimumFileSize;
                    maximumArrivals[index] = analysis.MaximumArrivals;
                    maximumDepartures[index] = analysis.MaximumDepartures;
                    maximumFileSize[index] = analysis.MaximumFileSize
                  }
                );
                console.log('Results Averaged Hourly');
                console.log(averageArrivals.slice(0, 5));
                console.log(averageDepartures.slice(0, 5));
                console.log(averageFileSize.slice(0, 5));
                console.log(minimumArrivals.slice(0, 5));
                console.log(minimumDepartures.slice(0, 5));
                console.log(minimumFileSize.slice(0, 5));
                console.log(maximumArrivals.slice(0, 5));
                console.log(maximumDepartures.slice(0, 5));
                console.log(maximumFileSize.slice(0, 5));
                console.log(startDates.slice(0, 5));
                console.log(stopDates.slice(0, 5));
                console.log(data.slice(0, 5));
              }
            });
          }
        }
        //Otherwise, show all points!
        else {
          for (var hive of message.hives) {
            VideoFile.find({
              HiveName: hive
            }, {
              _id: 0,
              HiveName: 1,
              ArrivalsTriangle: 1,
              DeparturesTriangle: 1,
              FileSize: 1,
              UTCDate: 1
            }, (err, data) => {
              if (err) {
                console.log(`Error retrieving data averaged bi-hourly: ${err}`);
              }
              else {
                let hivename = hive;
                let averageArrivals = [];
                let averageDepartures = [];
                let averageFileSize = [];
                let minimumArrivals = [];
                let minimumDepartures = [];
                let minimumFileSize = [];
                let maximumArrivals = [];
                let maximumDepartures = [];
                let maximumFileSize = [];
                let startDates = [];
                let stopDates = [];
                let response = data.map((analysis, index) => {
                    averageArrivals[index] = analysis.ArrivalsTriangle;
                    averageDepartures[index] = analysis.DeparturesTriangle;
                    averageFileSize[index] = analysis.FileSize;
                    startDates[index] = new Date(analysis.UTCDate);
                    stopDates[index] = new Date(analysis.UTCDate);
                    minimumArrivals[index] = analysis.ArrivalsTriangle;
                    minimumDepartures[index] = analysis.DeparturesTriangle;
                    minimumFileSize[index] = analysis.FileSize;
                    maximumArrivals[index] = analysis.ArrivalsTriangle;
                    maximumDepartures[index] = analysis.DeparturesTriangle;
                    maximumFileSize[index] = analysis.FileSize
                  }
                );
                console.log('Results Averaged Hourly');
                console.log(averageArrivals.slice(0, 5));
                console.log(averageDepartures.slice(0, 5));
                console.log(averageFileSize.slice(0, 5));
                console.log(minimumArrivals.slice(0, 5));
                console.log(minimumDepartures.slice(0, 5));
                console.log(minimumFileSize.slice(0, 5));
                console.log(maximumArrivals.slice(0, 5));
                console.log(maximumDepartures.slice(0, 5));
                console.log(maximumFileSize.slice(0, 5));
                console.log(startDates.slice(0, 5));
                console.log(stopDates.slice(0, 5));
                console.log(data.slice(0, 5));
              }
            });
          }
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
