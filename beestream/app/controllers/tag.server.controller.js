const mongoose = require('mongoose');
const Tag = mongoose.model('Tag');
const AvailableTag = mongoose.model('AvailableTag');
const config = require('../../config/config.js');

/*This file handles all socket.io configurations for the tag component.
* This includes creating the listeners and sending the appropriate emit
* messages.  I'll try to keep a list of messages and their meanings here,
* but as we know comment rot is a real thing, so this list might not be final.
* See the actual file for all entries.
*
******************************Incoming Messages********************************
* newTag: Signals that a user has clicked on a tag to be inserted into
*             the database.  This should insert the tag or increment a database
*             counter and return a new tag list for the video.
*
* getTags: Signals a request for a list of Tags for a given datetime/
*              hive pair.  This should return a list of all Tags for that
*              datetime/hive.
*
* decrementTag: a message signaling that a specific tag should have its count
*               decremented
*
******************************Outgoing Messages********************************
* tagList: Signals that a Tag list is being sent.  Should be accompanied
*              by a list of Tags.
*
*/
module.exports = function(io, socket) {

  /*newTag: Signals that a user has clicked on a tag to be inserted into
  *             the database.  This should insert the tag or increment a database
  *             counter and return a new tag list for the video.
  *
  * tagList: Signals that a Tag list is being sent.  Should be accompanied
  *              by a list of Tags.
  */
  socket.on('newTag', (message) => {
    var hive = message.hive;
    var date = new Date(message.datetime);
    var tag = message.tag;
    var month = (date.getMonth() + 1 < 10) ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
    var day = (date.getDate() < 10) ? `0${date.getDate()}` : `${date.getDate()}`;
    var hour = (date.getHours() < 10) ? `0${date.getHours()}` : `${date.getHours()}`;
    var minute = (date.getMinutes() < 10) ? `0${date.getMinutes()}` : `${date.getMinutes()}`;
    var second = (date.getSeconds() < 10) ? `0${date.getSeconds()}` : `${date.getSeconds()}`;
    var filepath = `${config.videoPath}/${hive}/` +
                   `${date.getFullYear()}-${month}-${day}` +
                   `/video/${hour}-${minute}-${second}.h264`;
    AvailableTag.find({}, {_id: 0}, (err, tags) => {
      var validTags = [];
      for (var singleTag of tags) {
        validTags.push(singleTag.Tag);
      }
      if (err) {
        console.log(`Error retreiving avaliable tags: ${err}`);
      }
      else if (hive != null && date != null
          && tag != null && validTags.includes(tag)) {
        Tag.findOneAndUpdate({
          HiveName: hive,
          UTCDate: date,
          Tag: tag,
          FilePath: filepath
        }, {
          $inc : {'Count': 1}
        },
        {
          'upsert': 1
        },
        (err) => {
          if (err) {
            console.log(`Error inserting into database: ${err}.`);
          }
          else {
            Tag.find({
              UTCDate: date,
              HiveName: hive
            }, {_id: 0, Tag: 1, Count: 1}).sort({Tag: -1}).exec((err, tags) => {
              if (err) {
                console.log(`Error retrieving tag list with error: ${err}`);
              }
              else {
                var tagList = [];
                var tagNames = [];
                for (tag of tags) {
                  tagList.push({name: tag.Tag, count: tag.Count});
                  tagNames.push(tag.Tag);
                }
                AvailableTag.find({}, {}, (err, tags) => {
                  if (err) {
                    console.log(`Error retreiving avaliable tags: ${err}`);
                  }
                  else {
                    for (tag of tags) {
                      if (!tagNames.includes(tag.Tag)) {
                        tagList.push({name: tag.Tag, count: 0});
                      }
                    }
                    socket.emit('tagList', {
                      tags: tagList
                    });
                  }
                });
              }
            });
          }
        });
      }
      else {
        console.log("[INPUT] : Incomplete tag request recieved.");
      }
    })
  });

  /*decrementTag: a message signaling that a specific tag should have its count
  *               decremented
  *
  * tagList: Signals that a Tag list is being sent.  Should be accompanied
  *              by a list of Tags.
  */
  socket.on('decrementTag', (message) => {
    var hive = message.hive;
    var date = new Date(message.datetime);
    var tag = message.tag;
    var month = (date.getMonth() + 1 < 10) ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
    var day = (date.getDate() < 10) ? `0${date.getDate()}` : `${date.getDate()}`;
    var hour = (date.getHours() < 10) ? `0${date.getHours()}` : `${date.getHours()}`;
    var minute = (date.getMinutes() < 10) ? `0${date.getMinutes()}` : `${date.getMinutes()}`;
    var second = (date.getSeconds() < 10) ? `0${date.getSeconds()}` : `${date.getSeconds()}`;
    var filepath = `${config.videoPath}/${hive}/` +
                   `${date.getFullYear()}-${month}-${day}` +
                   `/video/${hour}-${minute}-${second}.h264`;
    AvailableTag.find({}, {_id: 0}, (err, tags) => {
      var validTags = [];
      for (var singleTag of tags) {
        validTags.push(singleTag.Tag);
      }
      if (err) {
        console.log(`Error retreiving avaliable tags: ${err}`);
      }
      else if (hive != null && date != null
          && tag != null && validTags.includes(tag)) {
        Tag.findOneAndUpdate({
          HiveName: hive,
          UTCDate: date,
          Tag: tag,
          FilePath: filepath
        }, {
          $inc : {'Count': -1}
        },
        (err) => {
          if (err) {
            console.log(`Error decrementing ${tag}: ${err}.`);
          }
          else {
            Tag.find({
              UTCDate: date,
              HiveName: hive
            }, {_id: 0, Tag: 1, Count: 1}).sort({Tag: -1}).exec((err, tags) => {
              if (err) {
                console.log(`Error retrieving tag list with error: ${err}`);
              }
              else {
                var tagList = [];
                var tagNames = [];
                for (tag of tags) {
                  tagList.push({name: tag.Tag, count: tag.Count});
                  tagNames.push(tag.Tag);
                }
                AvailableTag.find({}, {}, (err, tags) => {
                  if (err) {
                    console.log(`Error retreiving avaliable tags: ${err}`);
                  }
                  else {
                    for (tag of tags) {
                      if (!tagNames.includes(tag.Tag)) {
                        tagList.push({name: tag.Tag, count: 0});
                      }
                    }
                    socket.emit('tagList', {
                      tags: tagList
                    });
                  }
                });
              }
            });
          }
        });
      }
      else {
        console.log("[INPUT] : Incomplete tag request recieved.");
      }
    });
  });

  /* getTags: Signals a request for a list of Tags for a given datetime/
  *              hive pair.  This should return a list of all Tags for that
  *              datetime/hive.
  *
  * tagList: Signals that a Tag list is being sent.  Should be accompanied
  *              by a list of Tags.
  */
  socket.on('getTags', (message) => {
    var date = new Date(message.datetime);
    var hive = message.hive;
    Tag.find({
      UTCDate: date,
      HiveName: hive
    }, {_id: 0, Tag: 1, Count: 1}).sort({Tag: -1}).exec((err, tags) => {
      if (err) {
        console.log(`Error retrieving tag list with error: ${err}`);
      }
      else {
        var tagList = [];
        var tagNames = [];
        for (tag of tags) {
          tagList.push({name: tag.Tag, count: tag.Count});
          tagNames.push(tag.Tag);
        }
        AvailableTag.find({}, {}, (err, tags) => {
          if (err) {
            console.log(`Error retreiving avaliable tags: ${err}`);
          }
          else {
            for (tag of tags) {
              if (!tagNames.includes(tag.Tag)) {
                tagList.push({name: tag.Tag, count: 0});
              }
            }
            socket.emit('tagList', {
              tags: tagList
            });
          }
        });
      }
    });
  });
}
