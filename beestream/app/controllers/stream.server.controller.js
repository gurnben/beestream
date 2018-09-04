const config = require('../../config/config.js');
const fs = require('fs');
const {spawn} = require('child_process');
const {join} = require('path');
const mongoose = require('mongoose');
const VideoFile = mongoose.model('VideoFile');
const ffmpegPath = config.ffmpegPath;

/*getDate
* Helper function to get the current date in the correct format: YYYY-MM-DD
* This shoud be removed and updated to use a new api if JS ever supports normal
* date.format() output.  Until that point, it is necessary.
*
* @return: the current date in YYYY-MM-DD format
*/
const getDate = function() {
  var files = []

  /*At this time you have to do all this work to format dates. */
  var d = new Date();
  var dd = d.getDate();
  var mm = d.getMonth()+1;
  var yyyy = d.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm  = '0' + mm
  }
  var today = `${yyyy}-${mm}-${dd}`;
  return today;
}

/*This file handles all socket.io configurations for the streaming service.
* This includes creating the listeners and sending the appropriate emit
* messages.  I'll try to keep a list of messages and their meanings here,
* but as we know comment rot is a real thing, so this list might not be final.
* See the actual file for all entries.
*
******************************Incoming Messages********************************
* getStreamHive: The initial request for a list of hives.  This should respond
*                with a list of all of the hvies that are avaliable to stream.
*
* getStreamVideo: The request for a video to be served.  This should respond
*                 with the video url.
*
* closeSession: The request sent when a user closes the browser window. This
*               message is sent with any current video to ensure that the
*               video is garbage collected.
******************************Outgoing Messages********************************
* streamHiveList: The response should contain a JSON payload with the entry
*                 hiveName containing a list of the avalaible hives.
*
* streamRequestRecieved: The request for a video has been recieved and is being
*                       processed.
*
* streamReady: The video is ready to stream.  Should contain a JSON payload of
*             the URL to use to get the video.
*
* novideo: A message indicating that no videos exist for today.
*
* streamRequestReceived: A message indicating that a the request for a
*                        streaming request is being processed.
*
* streamReady: a message indicating that a stream is ready.  Accompanied by a
*              video URL.
*/
module.exports = function(io, socket) {

  /*getStreamHive: The initial request for a list of hives.  This should respond
  *                with a list of all hives that are avaliable to stream.
  *
  * streamHiveList: The response should contain a JSON payload with the entry
  *                 hiveName containing a list of the avalaible hives.
  *
  * This function should sanitize input to make sure that this is a hive we want
  * people to be able to stream.
  */
  socket.on('getStreamHive', (message) => {
    var today = getDate();
    //get today's date we're at time 00:00:00
    var date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate());
    //get the date after the date we're looking for (for a less-than value)
    var nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    var files = [];
    VideoFile.find({$and:[{UTCDate:{$lt:nextDate}},{UTCDate:{$gte:date}}]}, {_id: 0, HiveName: 1}, (err, hives) => {
      if (err) {
        console.log(`Error retrieving streaming hives: ${err}`);
      }
      else {
        let hiveList = [...new Set(hives.map(hive => hive.HiveName))];
        socket.emit('streamHiveList', {hiveNames: hiveList});
      }
    });
  });

  /*getStreamVideo: The request for a video to be served.  This should respond
  *                 with the video url.
  *
  * novideo: A message indicating that no videos exist for today.
  *
  * streamRequestReceived: A message indicating that a the request for a
  *                        streaming request is being processed.
  *
  * streamReady: a message indicating that a stream is ready.  Accompanied by a
  *              video URL.
  *
  * This will convert the video if necessary.
  */
  socket.on('getStreamVideo', (message) => {
    if (message.hive != null) {

      //get today's date we're at time 00:00:00
      var date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate());
      //get the date after the date we're looking for (for a less-than value)
      var nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      VideoFile.find({$and:[{UTCDate:{$lt:nextDate}},{UTCDate:{$gte:date}}]}, {_id: 0, FilePath: 1}, (err, hives) => {
        if (err) {
          console.log(`Error retrieving streaming hives: ${err}`);
        }
        else if (hives.length == 0) {
          console.log(`error: a hive: ${message.hive} was requested for ` +
                      'streaming that doesn\'t have videos for today.');
          socket.emit('novideo', {message: `No videos for today from ${message.hive}`});
          return;
        }
        else {
          let videos = hives.map(hive => hive.FilePath);
          videos.sort().reverse();
          let mostRecent = videos[0];
          mostRecent = mostRecent.split('/');
          mostRecent = mostRecent[mostRecent.length - 1];
          mostRecent = mostRecent.replace('.h264', '');

          //let the client know that a video is loading
          socket.emit('streamRequestRecieved', {
            text: `Preparing to serve stream for ${message.hive}`
          });

          var today = getDate();
          var url = `/video/${message.hive}@${today}@${mostRecent}`;
          var requestPath = `${config.videoPath}/${message.hive}/${today}/video/${mostRecent}.h264`;

          //If it's already converted, we don't need to convert it.
          if(fs.existsSync(`./video/${message.hive}@${today}@${mostRecent}`)) {
            socket.emit('streamReady', {
              url: url
            });
          }

          //If it hasn't been converted, convert and serve.
          else {
            const convert = spawn(`${ffmpegPath}ffmpeg`, ['-framerate', '30', '-i', `${requestPath}`,
                                             '-c', 'copy',
                                             `./videotmp/${message.hive}@${today}@${mostRecent}.mp4`]);
            convert.on('close', (code) => {
              if (code != 0) {
                socket.emit('novideo', 'Something went wrong when serving the video.  Wait for a second or refresh the page!');
              }
              else {
                const mv = spawn('mv', [`./videotmp/${message.hive}@${today}@${mostRecent}.mp4`,
                                        `./video/${message.hive}@${today}@${mostRecent}.mp4`]);
                mv.on('close', (code) => {
                  if (code != 0) {
                    socket.emit('novideo', 'Something went wrong when serving the video.  Wait for a second or refresh the page!');
                  }
                  else {
                    socket.emit('streamReady', {
                      url: url
                    });
                  }
                });
              }
            });
          }

          //Delete the old file if there was one.
          if ((message.previous != null) && (message.previous != url)) {
            fs.unlink(`\.${message.previous}.mp4`, (err) => {
              if (err) {
                 console.log(`Unable to delete file .${message.previous}.mp4 in streaming getStreamVideo.`);
             }
            });
          }
        }
      });
    }
    else {
      socket.emit('error', {message: `Sorry, we encountered an error, try again later.`});
    }
  });

  /*closeSession: The request sent when a user closes the browser window. This
  *               message is sent with any current video to ensure that the
  *               video is garbage collected.
  *
  * This will delete the file that the user is done viewing.
  */
  socket.on('closeSession', (message) => {
    //Delete the old file if there was one.
    if (message.video != null) {
      fs.unlink(`\.${message.video}.mp4`, (err) => {
        if (err) {
           //console.log(`Unable to delete file .${message.video}.mp4 in streaming closeSession.`);
        }
      });
    }
  });
}
