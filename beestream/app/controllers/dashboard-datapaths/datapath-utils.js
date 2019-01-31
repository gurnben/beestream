var async = require('async');

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
const queryFromView = function(video_model, audio_model, hives, start, stop,
  viewQuerySelection, callback, aggregateMethod) {
  for (let hive of hives) {
    if (start && stop) {
      let startDate = new Date(start);
      let endDate = new Date(stop);
      async.parallel(
        {
          video: function(callback) {
            video_model.find({
              HiveName: hive,
              UTCStartDate: { "$gte": startDate, "$lte": endDate },
              UTCEndDate: { "$gte": startDate, "$lte": endDate }
            }, viewQuerySelection.video, (err, data) => {
              callback(err, data);
            });
          },
          audio: function(callback) {
            audio_model.find({
              HiveName: hive,
              UTCStartDate: { "$gte": startDate, "$lte": endDate },
              UTCEndDate: { "$gte": startDate, "$lte": endDate }
            }, viewQuerySelection.audio, (err, data) => {
              callback(err, data);
            });
          }
        }, (err, data) => {
          viewCallback(err, data, callback, aggregateMethod);
        }
      );
    }
    else {
      model.find({
        HiveName: hive
      }, viewQuerySelection, (err, data) => {
        viewCallback(err, data, callback, aggregateMethod);
      });
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
*   callback - a function to call back after processing data into a response
*   aggregateMethod - the method used to aggregate the data (ex. bi-hourly)
*/
const viewCallback = function(err, data, callback, aggregateMethod) {
  if (err) {
    console.log(`Error retrieving data: ${err}`);
  }
  else {

    //get a list of the datasets returned from the queries.
    let videoDataSets = [];
    for (let i = 0; i < data.video.length; i++) {
      for (let dataset of Object.keys(data.video[i].toJSON())) {
        if (!videoDataSets.includes(dataset)) {
          videoDataSets.push(dataset);
        }
      }
    }
    let audioDataSets = []
    for (let i = 0; i < data.audio.length; i++) {
      for (let dataset of Object.keys(data.audio[i].toJSON())) {
        if (!audioDataSets.includes(dataset)) {
          audioDataSets.push(dataset);
        }
      }
    }

    //Set up the response object's fields and populate them.
    let response = { video: {}, audio: {} };
    data.video.map((analysis, index) => {
      for (let dataset of videoDataSets) {
        if (!response.video[dataset]) {
          response.video[dataset] = [];
        }
        if (dataset.includes('date')) {
          resonse.video[dataset].push(new Date(analysis[dataset]));
        }
        else {
          response.video[dataset].push(analysis[dataset]);
        }
      }
    });
    response.video.HiveName = data.video[0].HiveName;
    data.audio.map((analysis, index) => {
      for (let dataset of audioDataSets) {
        if (!response.audio[dataset]) {
          response.audio[dataset] = [];
        }
        if (dataset.includes('date')) {
          resonse.audio[dataset].push(new Date(analysis[dataset]));
        }
        else {
          response.audio[dataset].push(analysis[dataset]);
        }
      }
    });
    response.audio.HiveName = data.audio[0].HiveName;

    response.HiveName = (response.audio.HiveName) ?
      response.audio.HiveName : response.video.HiveName;

    callback(response, aggregateMethod);
  }
}

var exports = module.exports = {
  queryFromView: queryFromView,
  viewCallback: viewCallback
};
