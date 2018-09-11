const config = require('../../config/config.js');
const fs = require('fs');
const {spawn} = require('child_process');
const {spawnSync} = require('child_process');
const {join} = require('path');
const mongoose = require('mongoose');
const VideoFile = mongoose.model('VideoFile');
const ffmpegPath = config.ffmpegPath;


/*This file handles all socket.io configurations for the article service.
* This includes creating the listeners and sending the appropriate emit
* messages.  I'll try to keep a list of messages and their meanings here,
* but as we know comment rot is a real thing, so this list might not be final.
* See the actual file for all entries.
*
******************************Incoming Messages********************************
* getHive: The initial request for a list of hives.  This should respond with
*            a list of all of the hvies that are avaliable to view.
*
* getDate: The request for a list of avaliable dates based on the selected
*          hive.  Should respond with a list of all dates avaliable to view
*          for that hive.
*
* getTime: The request for a list of avaliable times based on the selected
*          hive and date.  Should respond with a list of all dates avaliable
*          to view for that hive.
*
* getVideo: The request for a specific video to be served.  This request will
*           be accompanied by a hive, date, and time to identify a specific
*           video to convert and serve!
*
* closeSession: The request sent when a user closes the browser window. This
*               message is sent with any current video to ensure that the
*               video is garbage collected.
******************************Outgoing Messages********************************
* hiveList: The response should contain a JSON payload with the entry hiveNames
*           containing a list of the avalaible hives.
*
* dateList: The Response should contain a JSON payload with the entry date
*           contianing a list of the avaliable dates to view for that hive.
*
* timeList: The Response should contain a JSON payload with the entry time
*           contianing a list of the avaliable times to view for that hive.
*
* videoRequestRecieved: The request for a video has been recieved and is being
*                       processed.
*
* videoReady: The video is ready to stream.  Should contain a JSON payload of
*             the URL to use to get the video.
*/
module.exports = function(io, socket) {
  /*getHive: The initial request for a list of hives.  This should respond with
  *          a list of all of the hives that are avaliable to view.
  * This function should sanitize input to make sure that this is a hive we want
  * the user to view.
  */
  socket.on('getHive', (message) => {
    VideoFile.find().distinct('HiveName', (err, hives) => {
      if (err) {
        console.log(`Error Retrieving Hive List: ${err}`);
      }
      else {
        hives.sort();
        socket.emit('hiveList', {hiveNames: hives});
      }
    });
  });

  /*getDate: The request for a list of avaliable dates based on the selected
  *          hive.  Should respond with a list of all dates avaliable to view
  *          for that hvie.
  * This function needs to recieve a hive as input.  If not it will respond with
  * an empty list.
  */
  socket.on('getDate', (message) => {
    VideoFile.aggregate([
      { "$project": {
          "year": { "$year": "$UTCDate" },
          "month": { "$month": "$UTCDate" },
          "day" : {"$dayOfMonth": "$UTCDate"},
          "HiveName": 1
      }},
      { "$match": {
          "HiveName": message.hive
        }
      },
      { "$group": {
        "_id": null,
        "distinctDate": { "$addToSet": { "year": "$year", "month": "$month", "day": "$day"}}
      }}
    ]).exec((err, results) => {
      if (err) {
        console.log(`Error retrieving date list: ${err}`);
      }
      else {
        let distinctDates = results[0].distinctDate;
        let dates = [];
        for (var date of distinctDates) {
          var dt = (date.day < 10) ? `0${date.day}` : `${date.day}`;
          var month = (date.month < 10) ? `0${date.month}` : `${date.month}`;
          dates.push(`${date.year}-${month}-${dt}`);
        }
        dates.sort().reverse();
        socket.emit('dateList', {dates: dates});
      }
    });
  });

  /*getTime: The request for a list of avaliable times based on the selected
  *          hive and date.  Should respond with a list of all dates avaliable
  *          to view for that hvie.
  * This function needs to recieve a hive and date as input.  If not it will
  * respond with an empty list.
  */
  socket.on('getTime', (message) => {
    //get the date we're looking for at time 00:00:00
    var date = new Date(message.date);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 1);
    //get the date after the date we're looking for (for a less-than value)
    var nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    //query and respond
    VideoFile.find({$and:[{UTCDate:{$lt:nextDate}},{UTCDate:{$gte:date}}], HiveName: message.hive}, {_id: 0, FilePath: 1}, (err, videos) => {
      if (err) {
        console.log(`Error getting times: ${err}.`);
      }
      else {
        var files = []
        for (video of videos) {
          var filename = video.FilePath.split('/');
          filename = filename[filename.length - 1];
          filename = filename.replace('.h264', '');
          if (!files.includes(filename)) {
            files.push(filename);
          }
        }
        files.sort().reverse();
        socket.emit('timeList', {times: files});
      }
    });
  });

  /*closeSession: The request sent when a user closes the browser window. This
  *               message is sent with any current video to ensure that the
  *               video is garbage collected.
  *
  * This will delete the file that the user was viewing.
  */
  socket.on('closeSession', (message) => {
    if (message.video != null) {
      fs.unlink(`\.${message.video}.mp4`, (err) => {
      	if (err) {
      	  console.log(`Unable to delete file ${message.video}.mp4 in archive closeSession.`);
      	}
      });
    };
  });

  /*getVideo: The request for a specific video to be served.  This request will
  *           be accompanied by a hive, date, and time to identify a specific
  *           video to convert and serve!
  *
  * videoRequestRecieved: The request for a video has been recieved and is being
  *                       processed.
  *
  * videoReady: The video is ready to stream.  Should contain a JSON payload of
  *             the URL to use to get the video.
  */
  socket.on('getVideo', (message) => {
    //Build the path of the requested video
    var requestPath = `${config.videoPath}/${message.hive}/${message.date}/video/${message.time}.h264`;

    //If the user has selected a hive, date, and time and the video exists, serve it.
    if ((message.hive != null) && (message.date != null) &&
        (message.time != null) && fs.existsSync(requestPath)) {
      //Tell the client their request was recieved and is processing.
      socket.emit('videoRequestRecieved', {
        text: `Peparing to serve ${message.time}`
      });
      //If the file is already there, you don't have to convert it.
      if (fs.existsSync(`./video/${message.hive}@${message.date}@${message.time}.mp4`)) {
        socket.emit('videoReady', {
          url: `/video/${message.hive}@${message.date}@${message.time}`
        });
      }
      //Otherwise you have to convert the file and serve.
      else {

        const convert = spawn(`${ffmpegPath}ffmpeg`, ['-framerate', '30', '-i', `${requestPath}`, '-c', 'copy',
                              `./videotmp/${message.hive}@${message.date}@${message.time}.mp4`]);
        convert.on('close', (code) => {
          if (code != 0) {
            socket.emit('novideo', 'Something went wrong when serving the video.  Wait for a second or refresh the page!');
          }
          const mv = spawn('mv', [`./videotmp/${message.hive}@${message.date}@${message.time}.mp4`,
                                  `./video/${message.hive}@${message.date}@${message.time}.mp4`]);
          mv.on('close', (code) => {
            if (code != 0) {
              socket.emit('novideo', 'Something went wrong when serving the video.  Wait for a second or refresh the page!');
            }
            else {
              socket.emit('videoReady', {
                url: `/video/${message.hive}@${message.date}@${message.time}`
              });
            }
          });
        });
        /**************For debugging purposes***********/
        // convert.stdout.on('data', (data) => {
        //   console.log(`stdout: ${data}`);
        // });
        // convert.stderr.on('data', (data) => {
        //   console.log(`stderr: ${data}`);
        // });
        /**************For debugging purposes***********/
      }
      //Delete the old file if there was one.
      if (message.previous != null) {
        fs.unlink(`\.${message.previous}.mp4`, (err) => {
         if (err) {
            console.log(`Unable to delete file ${message.previous}.mp4 in archive getVideo.`);
  	     }
	     });
      }
    }
  });
 }
