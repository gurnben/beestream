const fs = require('fs');
const path = require('path');

/* This file will add functions to handle video requests and serve video files*/

/* This function will serve the requested video. */
exports.serve = function(req, res) {
  if (req.video) {
    fs.stat(`./video/${req.video}.mp4`, (err) => {
      if (err == null) {
        var readStream = fs.createReadStream(`./video/${req.video}.mp4`);
        res.writeHead(200, {
          'Content-Type': 'video/mp4'
        });
        readStream.pipe(res);
      }
      else if (err.code == 'ENOENT') {
        console.log(`File ${req.video} does not exist.`);
        res.writeHead(204, {});
        res.end();
      }
      else {
        console.log(`An unchecked error ${err} occurred while serving video.`);
        res.writeHead(404, {});
        res.end();
      }
    })
  }
};

/* This function handles the videoName parameter and sets req.video to it. */
const VIDEO_DIR = path.resolve('./video');

exports.videoName = function(req, res, next, vidName) {
  if (!vidName || vidName.indexOf('..') !== -1 || vidName.indexOf('/') !== -1 || vidName.indexOf('\\') !== -1 || vidName.indexOf('\0') !== -1) {
    res.writeHead(400, {});
    res.end();
    return;
  }
  var safeName = path.basename(vidName, '.mp4');
  var resolved = path.resolve(VIDEO_DIR, safeName + '.mp4');
  if (!resolved.startsWith(VIDEO_DIR + path.sep)) {
    res.writeHead(400, {});
    res.end();
    return;
  }
  req.video = safeName;
  next();
};
