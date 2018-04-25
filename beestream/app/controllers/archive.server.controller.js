const config = require('../../config/config.js');
const fs = require('fs');
const {spawn} = require('child_process');
const {join} = require('path');

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
*          to view for that hvie.
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
    var files = [];
    if (fs.existsSync(config.videoPath)) {
      //Note: We're making sure we only respond with directories.
      fs.readdirSync(config.videoPath).filter(file => fs.statSync(join(config.videoPath, file)).isDirectory()).forEach(file => {
        if (config.avaliableHives.includes(file)) {
          files.push(file);
        }
      });
    }
    socket.emit('hiveList', {hiveNames: files});
  });

  /*getDate: The request for a list of avaliable dates based on the selected
  *          hive.  Should respond with a list of all dates avaliable to view
  *          for that hvie.
  * This function needs to recieve a hive as input.  If not it will respond with
  * an empty list.
  */
  socket.on('getDate', (message) => {
    var files = []
    var requestPath = config.videoPath + '/' + message.text;
    if ((message.text != null) && (fs.existsSync(requestPath))) {
      //Note: We're making sure we only respond with directories.
      fs.readdirSync(requestPath).filter(file => fs.statSync(join(requestPath, file)).isDirectory()).forEach(file => {
        if (config.avaliableHives.includes(message.text)) {
          files.unshift(file);
        }
      });
    }
    socket.emit('dateList', {dates: files});
  });

  /*getTime: The request for a list of avaliable times based on the selected
  *          hive and date.  Should respond with a list of all dates avaliable
  *          to view for that hvie.
  * This function needs to recieve a hive and date as input.  If not it will
  * respond with an empty list.
  */
  socket.on('getTime', (message) => {
    var files = []
    var requestPath = config.videoPath + '/' + message.hive + '/' + message.date + '/video';
    if ((message.hive != null) && (message.date != null) &&
        (fs.existsSync(requestPath))) {
      fs.readdirSync(requestPath).forEach(file => {
        if (config.avaliableHives.includes(message.hive)) {
          files.unshift(file.slice(0, -5));
        }
      });
    }
    socket.emit('timeList', {times: files});
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

  /*videoRequestRecieved: The request for a video has been recieved and is being
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
        const convert = spawn('ffmpeg', ['-i', `${requestPath}`, '-c', 'copy',
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
