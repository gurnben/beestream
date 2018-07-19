const fs = require('fs');
const { exec } = require('child_process');
const { join } = require('path');
const mongoose = require('mongoose');

const config = require('../../config/config.js');
const Analysis = mongoose.model('Analysis');

const BeetLocation = config.beetPath;

/*This export handles all socket.io configurations for the analysis component.
* This includes creating the listeners and sending the appropriate emit
* messages.  I'll try to keep a list of messages and their meanings here,
* but as we know comment rot is a real thing, so this list might not be final.
* See the actual file for all entries.
*
******************************Incoming Messages********************************
* getAnalysis: a request for analysis of a video.  This should return
*              a JSON object containing an arrivals count and a departures count
*
******************************Outgoing Messages********************************
* videoAnalysisSuccess: Signals that video analysis is complete.  Should be
*                       accompanied by an arrivals count and a departures count.
* videoAnalysisFailure: Signals that video analysis failed.  This may indicate
*                       that we didn't have an entrance boundary for a video, or
*                       that we encountered another issue.  It will be
*                       accompanied by an error message.
*
*/
module.exports = function(io, socket) {

  /*getAnalysis: a request for analysis of a video.  This should return
  * a JSON object containing an arrivals count and a departures count.
  */
  socket.on('getAnalysis', (message) => {
    if (config.avaliableHives.includes(message.hive)) {
      Analysis.findOne({hive: message.hive, date: new Date(message.datetime)},
                    {_id: 0, arrivals: 1, departures: 1}).exec((err, result) => {
        if (err) {
          console.log(err);
        }
        else {
          if (result) {
            sendResults(false,
                        message.hive,
                        message.datetime,
                        result.arrivals,
                        result.departures,
                        socket);
          }
          else {
            var arrivals = 0, departures = 0;
            //Process the datetime into out folders and filenames
            var filepath = getFilepath(message.hive, message.datetime);
            //Find the entrance boundary configuration from the config file.
            var entranceConfig = getBoundaryConfig(message.hive, message.datetime);
            //analyze the video if we have a valid entrancConfig on file.
            if (entranceConfig) {
              const analyze = exec(`python3 ${BeetLocation}/beet.py -R ${entranceConfig} -v -s ${filepath}`);
              analyze.stdout.on('data', (data) => {
                [arrivals, departures] = data.substr(0, data.length - 1).split(' ');
              });
              analyze.on('close', (code) => {
                if (code != 0) {
                  console.log(`Something went wrong with analysis.  Return code ${code}.`);
                }
                else {
                  sendResults(true,
                              message.hive,
                              message.datetime,
                              arrivals,
                              departures,
                              socket);
                }
              });
            }
            else {
              socket.emit('videoAnalysisFailure', {
                message: 'No entrance configuraiton.'
              });
            }
          }
        }
      });
    }
    else {
      socket.emit('videoAnalysisFailure', {message: 'Invalid Hive'});
    }
  });
}

/************************************HELPER FUNCTIONS**************************/
/*getBoundaryConfig
* This funtion will return the entrance boundary config from the config file if
* there is one for this hive and date, and will return null if not.
*
* A boundary configuration is valid if the entranceBounds config entry for hive
* contains an entry with start < date and end >= date.
*
* @params:
*   hive - the hive that we are analyzing.
*   datetime - the video's datatime.
*/
function getBoundaryConfig(hive, datetime) {
  var entrances = config.entranceBounds[`${hive}`];
  var entranceConfig = null;
  if (entrances != null) {
    for (entrance of entrances) {
      var startdate = new Date(entrance.start);
      var enddate = new Date(entrance.end);
      var date = new Date(datetime);
      if (startdate < date
          && (enddate >= date
              || entrance.end == 'present')) {
        entranceConfig = entrance.rectangle;
        break;
      }
    }
  }
  return entranceConfig;
}

/*getFilepath
* This function constructs the filepath for the video analysis from a given hive
* and datetime.  The filepath is config.videoPath/hive/day/video/time.h264.
*
* @params:
*   hive - the hive the video comes from
*   datetime - the datetime of the video.
*/
function getFilepath(hive, datetime) {
  var date = new Date(datetime);
  var day = `${date.getFullYear()}` +
            `-${date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)}` +
            `-${date.getDate() > 9 ? date.getDate() : '0' + date.getDate()}`;
  var time = `${date.getHours() > 9 ? date.getHours() : '0' + date.getHours()}` +
             `-${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}` +
             `-${date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds()}`;
  var filepath = `${config.videoPath}/${hive}/${day}/video/${time}.h264`
  return filepath;
}

/*sendResults
* This function wraps the sending of a response to the client as well as writing
* the results to the database if store is true.
*
* @params:
*   store: boolean - a boolean to tell us whether or not to store the value in
*                     the database.
*   hive: string   - the hive that the video is from.
*   datetime: string - the datetiem of the video
*   arrivals: number - the number of arrivals from analysis
*   departures: number  - then number of departures from analysis
*   socket: socket.io socket - the socket to communicate through.
*/
function sendResults(store, hive, datetime, arrivals, departures, socket) {
  socket.emit('videoAnalysisSuccess', {
    datetime: new Date(datetime),
    hive: hive,
    arrivals: arrivals,
    departures: departures
  });
  if (store) {
    var newAnalysis = new Analysis({
      hive: hive,
      date: new Date(datetime),
      departures: departures,
      arrivals: arrivals
    });
    newAnalysis.save((err) => {
      if (err) {
        console.log(`Error inserting analysis into database: ${err}.`);
      }
    })
  }
}
