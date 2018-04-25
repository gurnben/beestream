const config = require('../../config/config.js');
const fs = require('fs');
const {spawn} = require('child_process');
const {join} = require('path');

/* Helper function to get the current date in the correct format: YYYY-MM-DD
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
* hiveStreamList: The response should contain a JSON payload with the entry
*                 hiveName containing a list of the avalaible hives.
*
* streamRequestRecieved: The request for a video has been recieved and is being
*                       processed.
*
* streamReady: The video is ready to stream.  Should contain a JSON payload of
*             the URL to use to get the video.
*/
module.exports = function(io, socket) {

  /*getStreamHive: The initial request for a list of hives.  This should respond
  *                with a list of all hives that are avaliable to stream.
  * This function should sanitize input to make sure that this is a hive we want
  * people to be able to stream.
  */
  socket.on('getStreamHive', (message) => {
    var today = getDate();
    var files = [];
    /* Check if a hive is valid and get the list */
    if (fs.existsSync(config.videoPath)) {
      fs.readdirSync(config.videoPath).filter(file => fs.statSync(join(config.videoPath, file)).isDirectory()).forEach(file => {
        if (config.avaliableHives.includes(file) &&
            fs.existsSync(`${config.videoPath}/${file}/${today}/video`) &&
            fs.readdirSync(`${config.videoPath}/${file}/${today}/video`).filter(file2 => fs.statSync(`${config.videoPath}/${file}/${today}/video/${file2}`).isFile()).length > 0) {
          files.push(file);
        }
      });
    }
    socket.emit('streamHiveList', {hiveNames: files});
  });

  /* getStreamVideo: The request for a video to be served.  This should respond
  *                 with the video url.
  * This will convert the video if necessary.
  */
  socket.on('getStreamVideo', (message) => {
    if (message.hive != null) {
      //Get today's date for use in the path.
      var today = getDate();
      //Variable to hold our video name.
      var time = null;

      //Build the path of the requested video
      var requestPath = `${config.videoPath}/${message.hive}/${today}/video/`;
      if ((message.hive != null) && fs.existsSync(requestPath)) {
        var videos = fs.readdirSync(requestPath)
                       .filter(file => fs.statSync(join(requestPath, file))
                       .isFile());
        if (videos.length > 0) {
          time = videos[videos.length - 1];
          requestPath += time;
        }
        else {
          console.log(`error: a hive: ${message.hive} was requested for ` +
                      'streaming that doesn\'t have videos for today.');
          socket.emit('novideo', {message: `No videos for today from ${message.hive}`});
          return;
        }
      }
      else {
    	  socket.emit('novideo', {message: `No videos for today from ${message.hive}.  Videos usually start at 8AM so check back then!`});
    	  return;
      }

      //If we've made it here, we have a video to convert and serve!
      socket.emit('streamRequestRecieved', {
        text: `Preparing to serve stream for ${message.hive}`
      });

      var url = `/video/${message.hive}@${today}@${time.slice(0, -5)}`;

      //If it's already converted, we don't need to convert it.
      if(fs.existsSync(`./video/${message.hive}@${today}@${time.slice(0, -5)}.mp4`)) {
        socket.emit('streamReady', {
          url: `/video/${message.hive}@${today}@${time.slice(0, -5)}`
        });
      }

      //If it hasn't been converted, convert and serve.
      else {
        const convert = spawn('ffmpeg', ['-i', `${requestPath}`, '-c',
                                         'copy', `./videotmp/${message.hive}@${today}@${time.slice(0, -5)}.mp4`]);
        convert.on('close', (code) => {
          if (code != 0) {
            socket.emit('novideo', 'Something went wrong when serving the video.  Wait for a second or refresh the page!');
          }
          const mv = spawn('mv', [`./videotmp/${message.hive}@${today}@${time.slice(0, -5)}.mp4`,
                                  `./video/${message.hive}@${today}@${time.slice(0, -5)}.mp4`]);
          mv.on('close', (code) => {
            if (code != 0) {
              socket.emit('novideo', 'Something went wrong when serving the video.  Wait for a second or refresh the page!');
            }
            else {
              socket.emit('streamReady', {
                url: `/video/${message.hive}@${today}@${time.slice(0, -5)}`
              });
            }
          });
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
    else {
      socket.emit('error', {message: `Safari is not yet supported, sorry!`});
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
