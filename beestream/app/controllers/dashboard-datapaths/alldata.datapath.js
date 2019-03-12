const async = require('async');
const mongoose = require('mongoose');
const VideoFile = mongoose.model('VideoFile');
const AudioFile = mongoose.model('AudioFiles');
const Weather = mongoose.model('Weather');
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
        queryConditions['UTCDate'] = { "$gte": new Date(startDate),
                                      "$lte": new Date(stopDate) };
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
          },
          weather: function(callback) {
            let weatherQueryConditions = Object.assign({}, queryConditions)
            delete weatherQueryConditions.HiveName;
            Weather.find(weatherQueryConditions, {},
            (err, data) => {
              callback(err, data);
            })
          }
        }, (err, data) => {

          //Set up reponse format/dataset
          response = {
            audio: {
              AverageRMSLinear: [],
              MaximumRMSLinear: [],
              MinimumRMSLinear: [],
              UTCStartDate: [],
              UTCEndDate: [],
              HiveName: ""
            },
            video: {
              AverageDepartures: [],
              MaximumDepartures: [],
              MinimumDepartures: [],
              AverageArrivals: [],
              MaximumArrivals: [],
              MinimumArrivals: [],
              UTCStartDate: [],
              UTCEndDate: [],
              HiveName: ""
            },
            weather: {
              Weather: [],
              Clouds: [],
              AverageTemperature: [],
              MinimumTemperature: [],
              MaximumTemperature: [],
              AverageHumidity: [],
              MinimumHumidity: [],
              MaximumHumidity: [],
              AverageWindspeed: [],
              MinimumWindspeed: [],
              MaximumWindspeed: [],
              AveragePrecipitation: [],
              MinimumPrecipitation: [],
              MaximumPrecipitation: [],
              UTCStartDate: [],
              UTCEndDate: []
            }
          }

          //Populate audio, video, and weather from query responses
          data.audio.map((analysis, index) => {
            response.audio.HiveName = analysis.HiveName;
            if (analysis.RMSLinear) {
              response.audio.AverageRMSLinear[index] = analysis.RMSLinear;
              response.audio.MinimumRMSLinear[index] = analysis.RMSLinear;
              response.audio.MaximumRMSLinear[index] = analysis.RMSLinear;
            }
            response.audio.UTCStartDate[index] = new Date(analysis.UTCDate);
            response.audio.UTCEndDate[index] = new Date(analysis.UTCDate);
          });
          data.video.map((analysis, index) => {
            response.video.HiveName = analysis.HiveName;
            if (analysis.ArrivalsTriangle) {
              response.video.AverageArrivals[index] = analysis.ArrivalsTriangle;
              response.video.MinimumArrivals[index] = analysis.ArrivalsTriangle;
              response.video.MaximumArrivals[index] = analysis.ArrivalsTriangle;
            }
            if (analysis.DeparturesTriangle) {
              response.video.AverageDepartures[index] = analysis.DeparturesTriangle;
              response.video.MinimumDepartures[index] = analysis.DeparturesTriangle;
              response.video.MaximumDepartures[index] = analysis.DeparturesTriangle;
            }
            response.video.UTCStartDate[index] = new Date(analysis.UTCDate);
            response.video.UTCEndDate[index] = new Date(analysis.UTCDate);
          });
          data.weather.map((analysis, index) => {
            if (analysis["Weather"]) {
              response.weather.Weather[index] = analysis["Weather"];
            }
            if (analysis["Level 1 clouds"]) {
               response.weather.Clouds[index] = analysis["Level 1 clouds"];
            }
            if (analysis["2m Air Temperature (F)"]) {
              response.weather.AverageTemperature[index] = analysis["2m Air Temperature (F)"];
              response.weather.MinimumTemperature[index] = analysis["2m Air Temperature (F)"];
              response.weather.MaximumTemperature[index] = analysis["2m Air Temperature (F)"];
            }
            if (analysis["2m Relative Humidity (percent)"]) {
              response.weather.AverageHumidity[index] = analysis["2m Relative Humidity (percent)"];
              response.weather.MinimumHumidity[index] = analysis["2m Relative Humidity (percent)"];
              response.weather.MaximumHumidity[index] = analysis["2m Relative Humidity (percent)"];
            }
            if (analysis["10m Wind Speed (mph)"]) {
              response.weather.AverageWindspeed[index] = analysis["10m Wind Speed (mph)"];
              response.weather.MinimumWindspeed[index] = analysis["10m Wind Speed (mph)"];
              response.weather.MaximumWindspeed[index] = analysis["10m Wind Speed (mph)"];
            }
            if (analysis["2m Hourly Precipitation (in)"]) {
              response.weather.AveragePrecipitation[index] = analysis["2m Hourly Precipitation (in)"];
              response.weather.MinimumPrecipitation[index] = analysis["2m Hourly Precipitation (in)"];
              response.weather.MaximumPrecipitation[index] = analysis["2m Hourly Precipitation (in)"];
            }
            response.weather.UTCStartDate[index] = new Date(analysis.UTCDate);
            response.weather.UTCEndDate[index] = new Date(analysis.UTCDate);
          });

          //Set empty datasets to null
          for (let channel of Object.keys(response)) {
            for (let key of Object.keys(response[channel])) {
              if ((response[channel][key] == null) || (response[channel][key].length == 0)) {
                response[channel][key] = null;
              }
            }
          }

          //Set a hivename field for all data
          response['HiveName'] = (response.audio.HiveName) ?
            response.audio.HiveName : response.video.HiveName;

          callbackFunction(response, "");
        }
      );
    }
  }
}

module.exports = alldata
