const config = require('../../config/config.js');
const fs = require('fs');

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
******************************Outgoing Messages********************************
* hiveList: The response should contain a JSON payload with the entry hiveNames
*           containing a list of the avalaible hives.
*
* dateList: The Response should contain a JSON payload with the entry date
*           contianing a list of the avaliable dates to view for that hive.
*
* timeList: The response should contain a JSON payload with the item time
            containing a list of the avaliable dates to view for that date.
*/
module.exports = function(io, socket) {
  /*getHive: The initial request for a list of hives.  This should respond with
  *          a list of all of the hives that are avaliable to view.
  * This function should sanitize input to make sure that this is a hive we want
  * the user to view.
  */
  socket.on('getHive', (message) => {
    var files = [];
    if (fs.existsSync(config.hivePath)) {
      fs.readdirSync(config.hivePath).forEach(file => {
        if (config.avaliableHives.includes(file)) {
          files.push(file);
        }
      });
    }
    io.emit('hiveList', {hiveNames: files});
  });

  /*getDate: The request for a list of avaliable dates based on the selected
  *          hive.  Should respond with a list of all dates avaliable to view
  *          for that hvie.
  * This function needs to recieve a hive as input.  If not it will respond with
  * an empty list.
  */
  socket.on('getDate', (message) => {
    var files = []
    var requestPath = config.hivePath + '/' + message.text;
    if ((message.text != null) && (fs.existsSync(requestPath))) {
      fs.readdirSync(requestPath).forEach(file => {
        if (config.avaliableHives.includes(message.text)) {
          files.push(file);
        }
      });
    }
    io.emit('dateList', {dates: files});
  });

  /*getTime: The request for a list of avaliable times based on the selected
  *          hive and date.  Should respond with a list of all dates avaliable
  *          to view for that hvie.
  * This function needs to recieve a hive and date as input.  If not it will
  * respond with an empty list.
  */
  socket.on('getTime', (message) => {
    var files = []
    var requestPath = config.hivePath + '/' + message.hive + '/' + message.date + '/video';
    if ((message.hive != null) && (message.date != null) &&
        (fs.existsSync(requestPath))) {
      fs.readdirSync(requestPath).forEach(file => {
        if (config.avaliableHives.includes(message.hive)) {
          files.push(file);
        }
      });
    }
    io.emit('timeList', {times: files});
  });

  /*sendTime: The request for the next step after the user has chosen a time.
  *           This will eventually serve a video.
  */
  socket.on('sendTime', (message) => {
    var requestPath = config.hivePath + '/' + message.hive + '/' + message.date + '/video/' + message.time;
    if ((message.hive != null) && (message.date != null) && (message.time != null) && fs.existsSync(requestPath)) {
      io.emit('serveVideo', {
        name: message.time,
        fsStats: fs.statSync(requestPath)
      });
    }
  });
 }
