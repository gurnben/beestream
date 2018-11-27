const mongoose = require('mongoose');
const VideoFile = mongoose.model('VideoFile');
const utils = require('./datapath-utils.js');

module.exports = {
  name: 'alldata',
  threshold: 120,
  query: async function(viewQuerySelection, hives, startDate, stopDate, callback) {
    for (var hive of hives) {
      let queryConditions = {
        HiveName: hive
      }
      if (startDate && stopDate) {
        queryConditions = {
          HiveName: hive,
          UTCDate: { "$gte": new Date(startDate),
            "$lte": new Date(stopDate) }
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
          callback(response);
        }
      });
    }
  }
}
