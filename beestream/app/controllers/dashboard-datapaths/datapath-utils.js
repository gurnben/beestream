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
const queryFromView = function(model, hives, start, stop, viewQuerySelection,
  callback) {
  for (let hive of hives) {
    if (start && stop) {
      let startDate = new Date(start);
      let endDate = new Date(stop);
      model.find({
        HiveName: hive,
        UTCStartDate: { "$gte": startDate, "$lte": endDate },
        UTCEndDate: { "$gte": startDate, "$lte": endDate }
      }, viewQuerySelection, (err, data) => {
        viewCallback(err, data, callback);
      });
    }
    else {
      model.find({
        HiveName: hive
      }, viewQuerySelection, (err, data) => {
        viewCallback(err, data, callback);
      });
    }
  }
}

//TODO: Figure out data flow with async methods in order to asynchronously send a response back to dashboard.server.controller

/*viewCallback
* This function is our callback for the view queries.  . This will reformat
* the data into separate lists and send them as a response.
*
* @params:
*   err - any errors thrown by the query.
*   data - the data returned from the view query
*/
const viewCallback = function(err, data, callback) {
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
    callback(response);
  }
}

var exports = module.exports = {
  queryFromView: queryFromView,
  viewCallback: viewCallback
};
