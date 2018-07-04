const mongoose = require('mongoose');
const Tag = mongoose.model('Tag');
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
* getComments: Signals a request for a list of comments for a given datetime/
*              hive pair.  This should return a list of all comments for that
*              datetime/hive.
*
******************************Outgoing Messages********************************
* commentList: Signals that a comment list is being sent.  Should be accompanied
*              by a list of comments.
*
*/
module.exports = function(io, socket) {

  /* This will handle the creation or incrementing of tags. */
  socket.on('newTag', (message) => {
    var hive = message.hive;
    var date = message.datetime;
    var tag = message.tag;
    if (hive != null && date != null
        && tag != null && config.tags.includes(tag)) {
      Tag.findOneAndUpdate({
        hive: hive,
        date: date,
        tag: tag
      }, {
        $inc : {'count': 1}
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
            date: date,
            hive: hive
          }, {_id: 0, tag: 1, count: 1}).sort({tag: -1}).exec((err, tags) => {
            if (err) {
              console.log(`Error retrieving tag list with error: ${err}`);
            }
            else {
              var tagList = [];
              var tagNames = [];
              for (tag of tags) {
                tagList.push({name: tag.tag, count: tag.count});
                tagNames.push(tag.tag);
              }
              for (tag of config.tags) {
                if (!tagNames.includes(tag)) {
                  tagList.push({name: tag, count: 0});
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
    else {
      console.log("[INPUT] : Incomplete tag request recieved.");
    }
  });

  socket.on('decrementTag', (message) => {
    var hive = message.hive;
    var date = message.datetime;
    var tag = message.tag;
    if (hive != null && date != null
        && tag != null && config.tags.includes(tag)) {
      Tag.findOneAndUpdate({
        hive: hive,
        date: date,
        tag: tag
      }, {
        $inc : {'count': -1}
      },
      (err) => {
        if (err) {
          console.log(`Error decrementing ${tag}: ${err}.`);
        }
        else {
          Tag.find({
            date: date,
            hive: hive
          }, {_id: 0, tag: 1, count: 1}).sort({tag: -1}).exec((err, tags) => {
            if (err) {
              console.log(`Error retrieving tag list with error: ${err}`);
            }
            else {
              var tagList = [];
              var tagNames = [];
              for (tag of tags) {
                tagList.push({name: tag.tag, count: tag.count});
                tagNames.push(tag.tag);
              }
              for (tag of config.tags) {
                if (!tagNames.includes(tag)) {
                  tagList.push({name: tag, count: 0});
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
    else {
      console.log("[INPUT] : Incomplete tag request recieved.");
    }
  });

  /* This will handle the retrieval of tags. */
  socket.on('getTags', (message) => {
    var date = message.datetime
    var hive = message.hive;
    Tag.find({
      date: date,
      hive: hive
    }, {_id: 0, tag: 1, count: 1}).sort({tag: -1}).exec((err, tags) => {
      if (err) {
        console.log(`Error retrieving tag list with error: ${err}`);
      }
      else {
        var tagList = [];
        var tagNames = [];
        for (tag of tags) {
          tagList.push({name: tag.tag, count: tag.count});
          tagNames.push(tag.tag);
        }
        for (tag of config.tags) {
          if (!tagNames.includes(tag)) {
            tagList.push({name: tag, count: 0});
          }
        }
        socket.emit('tagList', {
          tags: tagList
        });
      }
    });
  });
}
