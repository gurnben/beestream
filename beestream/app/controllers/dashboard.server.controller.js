const mongoose = require('mongoose');
const VideoFile = mongoose.model('VideoFile');
const AverageTrafficByHour = mongoose.model('AverageTrafficByHour');
const AverageTrafficBiHourly = mongoose.model('AverageTrafficBiHourly');
const AverageTrafficByDay = mongoose.model('AverageTrafficByDay');
const HivesWithAnalysis = mongoose.model('HivesWithAnalysis');
const config = require('../../config/config');
const DAILY_THRESHOLD = 2;
const BI_HOURLY_THRESHOLD = 6;
const HOURLY_THRESHOLD = 60;
const AVERAGE_VIDEOS_PER_DAY = HOURLY_THRESHOLD + 1;

module.exports = function(io, socket) {

  //This is the list of fields that will be used for our view queries
  const viewQuerySelection = {
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
  }

  /*queryFromView
  * This function will query from a given model for a hive between start and
  * stop date.
  *
  * @params:
  *   model - the mongoose model to query from.
  *   hives - the hives to query for.
  *   start - a string or number representing the start date of the query
  *   stop - a string or number representing the stop date of the query.
  */
  const queryFromView = function(model, hives, start, stop) {
    for (let hive of hives) {
      if (start && stop) {
        let startDate = new Date(start);
        let endDate = new Date(stop);
        model.find({
          HiveName: hive,
          UTCStartDate: { "$gte": startDate, "$lte": endDate },
          UTCEndDate: { "$gte": startDate, "$lte": endDate }
        }, viewQuerySelection, viewCallback);
      }
      else {
        model.find({
          HiveName: hive
        }, viewQuerySelection, viewCallback);
      }
    }
  }

  /*viewCallback
  * This function is our callback for the view queries.  . This will reformat
  * the data into separate lists and send them as a response.
  *
  * @params:
  *   err - any errors thrown by the query.
  *   data - the data returned from the view query
  */
  const viewCallback = function(err, data) {
    if (err) {
      console.log(`Error retrieving data: ${err}`);
    }
    else {
      let hivename = "";
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
      data.map((analysis, index) => {
          hivename = analysis.HiveName;
          averageArrivals[index] = analysis.AverageArrivals;
          averageDepartures[index] = analysis.AverageDepartures;
          averageFileSize[index] = analysis.AverageFileSize
          startDates[index] = new Date(analysis.UTCStartDate);
          stopDates[index] = new Date(analysis.UTCEndDate);
          minimumArrivals[index] = analysis.MinimumArrivals;
          minimumDepartures[index] = analysis.MinimumDepartures;
          minimumFileSize[index] = analysis.MinimumFileSize;
          maximumArrivals[index] = analysis.MaximumArrivals;
          maximumDepartures[index] = analysis.MaximumDepartures;
          maximumFileSize[index] = analysis.MaximumFileSize;
        }
      );
      let response = {
        AverageArrivals: averageArrivals,
        AverageDepartures: averageDepartures,
        AverageFileSize: averageFileSize,
        MinimumArrivals: minimumArrivals,
        MinimumDepartures: minimumDepartures,
        MinimumFileSize: minimumFileSize,
        MaximumArrivals: maximumArrivals,
        MaximumDepartures: maximumDepartures,
        MaximumFileSize: maximumFileSize,
        StartDates: startDates,
        StopDates: stopDates,
        HiveName: hivename
      };
      sendResponse(response);
    }
  }

  /*sendResponse
  * This function will send an updateData response with the given data.
  *
  * @params:
  *   data - the data to send to the client.
  */
  const sendResponse = function(data) {
    //Do any other data processing/filtertering/custom responses here.
    socket.emit('updateData', data);
  }

  //Socket handler to return analysis data for a hive.
  socket.on('getData', (message) => {

    //Set our data counting conditions based on start and stop date.
    let countConditions = {
      HiveName: {"$in": message.hives}
    }
    if (message.startDate && message.stopDate) {
      countConditions = {
        HiveName: {"$in": message.hives},
        UTCStartDate: { "$gte": new Date(message.startDate),
          "$lte": new Date(message.stopDate) },
        UTCEndDate: { "$gte": new Date(message.startDate),
          "$lte": new Date(message.stopDate) }
      }
    }

    //Get a count of days with analysis in order to determine how many points to
    //show per day!
    AverageTrafficByDay.countDocuments(countConditions,
      (err, documentCount) => {
      if (err) {
        console.log(`Error getting item count: ${err}`);
      }
      else {
        let videosPerDay = AVERAGE_VIDEOS_PER_DAY;
        if (documentCount > 0) {
          videosPerDay = Math.floor( message.count / documentCount );
        }

        //If we can show 2 or less videos per day, show only a daily average
        if (videosPerDay <= DAILY_THRESHOLD) {
          queryFromView(AverageTrafficByDay,
            message.hives, message.startDate, message.stopDate);
        }
        //If we can show 2-6 videos per day, show an average of every other hour
        else if (videosPerDay <= BI_HOURLY_THRESHOLD) {
          queryFromView(AverageTrafficBiHourly, message.hives,
            message.startDate, message.stopDate);
        }
        //If we can show less than 60 things, show one point for each hour
        else if (videosPerDay <= HOURLY_THRESHOLD) {
          queryFromView(AverageTrafficByHour, message.hives,
            message.startDate, message.stopDate);
        }
        //Otherwise, show all points!
        else {
          for (var hive of message.hives) {
            let queryConditions = {
              HiveName: hive
            }
            if (message.startDate && message.stopDate) {
              queryConditions = {
                HiveName: hive,
                UTCDate: { "$gte": new Date(message.startDate),
                  "$lte": new Date(message.stopDate) }
              }
            }
            VideoFile.find(queryConditions, {
              _id: 0,
              HiveName: 1,
              ArrivalsTriangle: 1,
              DeparturesTriangle: 1,
              FileSize: 1,
              UTCDate: 1
            }, (err, data) => {
              if (err) {
                console.log(`Error retrieving data from view: ${err}`);
              }
              else {
                let hivename = hive;
                let averageArrivals = [];
                let averageDepartures = [];
                let averageFileSize = [];
                let dates = [];
                data.map((analysis, index) => {
                    averageArrivals[index] = analysis.ArrivalsTriangle;
                    averageDepartures[index] = analysis.DeparturesTriangle;
                    averageFileSize[index] = analysis.FileSize;
                    dates[index] = new Date(analysis.UTCDate);
                  }
                );

                let response = {
                  AverageArrivals: averageArrivals,
                  AverageDepartures: averageDepartures,
                  AverageFileSize: averageFileSize,
                  MinimumArrivals: averageArrivals,
                  MinimumDepartures: averageDepartures,
                  MinimumFileSize: averageFileSize,
                  MaximumArrivals: averageArrivals,
                  MaximumDepartures: averageDepartures,
                  MaximumFileSize: averageFileSize,
                  StartDates: dates,
                  StopDates: dates,
                  HiveName: hivename
                };
                sendResponse(response);
              }
            });
          }
        }
      }
    });
  });

  //Handler to return our list of hives and dates
  socket.on('dashboardConnect', (message) => {
    HivesWithAnalysis.find({}, { "_id": 0 }, (err, hives) => {
      if (err) {
        console.log(`Error Retrieving Hive List: ${err}`);
      }
      else {
        let hiveNames = hives.map(value => value.HiveName);
        hiveNames.sort();
        let hiveDates = {};
        for (let data of hives) {
          hiveDates[data.HiveName] = {
            "StartDate": data.StartDate,
            "EndDate": data.EndDate
          }
        }
        socket.emit('dashboardHiveList', {
          hiveNames: hiveNames,
          dates: hiveDates
        });
      }
    });
    AverageTrafficByDay.distinct('UTCStartDate', {}, (err, result) => {
      if (err) {
        console.log(`Error getting distinct startdate list: ${err}`);
      }
      else {
        result.sort((a, b) => {
          let ad = new Date(a);
          let bd = new Date(b);
          return ad - bd;
        });
        socket.emit('availableDateList', {
          dateList: result
        });
      }
    })
  });
}
