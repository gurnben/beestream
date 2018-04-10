const fs = require('fs');

/* This file will add functions to handle video requests and serve video files*/

/* This function will serve the requested video. */
exports.serve = function(req, res) {
  if (req.video) {
    var readStream = fs.createReadStream(`./video/${req.video}.mp4`);
    res.writeHead(200, {
      'Content-Type': 'video/mp4'
    });
    readStream.pipe(res);
  }
};

/* This function handles the videoName parameter and sets req.video to it. */
exports.videoName = function(req, res, next, vidName) {
  req.video = vidName;
  next();
};
