const async = require('async');
const mongoose = require('mongoose');
const VideoFile = mongoose.model('VideoFile');
const AudioFile = mongoose.model('AudioFiles');
const utils = require('./datapath-utils.js');

var alldata = {
  name: 'alldata',
  aggregateMethod: '',
  threshold: 120,
  query: async function(viewQuerySelection, hives, startDate, stopDate, callbackFunction) {
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
      async.parallel(
        {
          video: function(callback) {
            VideoFile.find(queryConditions, {
              ArrivalsTriangle: 1,
              DeparturesTriangle: 1,
              UTCDate: 1,
              HiveName: 1
            },
            (err, data) => {
              callback(err, data);
            });
          },
          audio: function(callback) {
            AudioFile.find(queryConditions, {
              RMSLinear: 1,
              UTCDate: 1,
              HiveName: 1,
            },
            (err, data) => {
              callback(err, data);
            });
          }
        }, (err, data) => {
          response = {
            audio: {
              AverageRMSLinear: [],
              UTCStartDate: [],
              UTCEndDate: [],
              HiveName: ""
            },
            video: {
              AverageArrivals: [],
              AverageDepartures: [],
              UTCStartDate: [],
              UTCEndDate: [],
              HiveName: ""
            }
          }
          data.audio.map((analysis, index) => {
            response.audio.HiveName = analysis.HiveName;
            response.audio.AverageRMSLinear[index] = analysis.RMSLinear;
            response.audio.UTCStartDate[index] = new Date(analysis.UTCDate);
            response.audio.UTCEndDate[index] = new Date(analysis.UTCDate);
          });
          data.video.map((analysis, index) => {
            response.video.HiveName = analysis.HiveName;
            response.video.AverageArrivals[index] = analysis.ArrivalsTriangle;
            response.video.AverageDepartures[index] = analysis.DeparturesTriangle;
            response.video.UTCStartDate[index] = new Date(analysis.UTCDate);
            response.video.UTCEndDate[index] = new Date(analysis.UTCDate);
          });

          response['HiveName'] = (response.audio.HiveName) ?
            response.audio.HiveName : response.video.HiveName;

          callbackFunction(response, "");
        }
      );
      // VideoFile.find(queryConditions, {
      //   _id: 0,
      //   HiveName: 1,
      //   ArrivalsTriangle: 1,
      //   DeparturesTriangle: 1,
      //   FileSize: 1,
      //   UTCDate: 1
      // }, (err, data) => {
      //   if (err) {
      //     console.log(`Error retrieving data from view: ${err}`);
      //   }
      //   else {
      //     let hivename = hive;
      //     let averageArrivals = [];
      //     let averageDepartures = [];
      //     let averageFileSize = [];
      //     let dates = [];
      //     data.map((analysis, index) => {
      //         averageArrivals[index] = analysis.ArrivalsTriangle;
      //         averageDepartures[index] = analysis.DeparturesTriangle;
      //         averageFileSize[index] = analysis.FileSize;
      //         dates[index] = new Date(analysis.UTCDate);
      //       }
      //     );
      //
      //     let response = {
      //       AverageArrivals: averageArrivals,
      //       AverageDepartures: averageDepartures,
      //       AverageFileSize: averageFileSize,
      //       MinimumArrivals: averageArrivals,
      //       MinimumDepartures: averageDepartures,
      //       MinimumFileSize: averageFileSize,
      //       MaximumArrivals: averageArrivals,
      //       MaximumDepartures: averageDepartures,
      //       MaximumFileSize: averageFileSize,
      //       StartDates: dates,
      //       StopDates: dates,
      //       HiveName: hivename
      //     };
      //     callback(response, '');
      //   }
      // });
    }
  }
}

module.exports = alldata
