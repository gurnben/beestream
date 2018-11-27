const mongoose = require('mongoose');
const fs = require('fs');
const AverageTrafficByDay = mongoose.model('AverageTrafficByDay');
const HivesWithAnalysis = mongoose.model('HivesWithAnalysis');
const config = require('../../config/config');
const AVERAGE_VIDEOS_PER_DAY = 120
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
let datapaths = {};
path = require('path').resolve("app/controllers/dashboard-datapaths/");
require('fs').readdirSync(path).forEach((file) => {
  let datapath = require(`${path}/${file}`);
  if (datapath.threshold && datapath.query) {
    datapaths[datapath.threshold] = {
      query: datapath.query,
      name: datapath.name
    }
  }
});

module.exports = function(io, socket) {

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

        //Choose the appropriate datapath based on the threshold of each
        //datapath file.
        let sortedThresholds = Object.keys(datapaths).sort((a, b) => a - b);
        let chosenThreshold = sortedThresholds[0];
        for (let i = 1; i < sortedThresholds.length; i++) {
          if (Math.abs(videosPerDay - sortedThresholds[i])
                < Math.abs(videosPerDay - chosenThreshold)) {
            chosenThreshold = sortedThresholds[i];
          }
        }
        datapaths[chosenThreshold].query(viewQuerySelection, message.hives,
              message.startDate, message.stopDate, sendResponse);
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
