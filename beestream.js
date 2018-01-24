const http = require ('http');
const path = require('path');
const express = require('express');
const ls = require('ls');
const fs = require('fs');
const spawnSync = require('child_process').spawnSync;

function getMostRecent() {
  //get today's date and request that
  var all_files = ls('/home/gurnben/Videos/2017-07-21/video/*');
  all_files = all_files.filter(function(filename) {
    return filename.file.endsWith('.h264');
  });
  return all_files[all_files.length - 1];
}

function convertFile() {
  var mostRecent = getMostRecent();
  var newFile = __dirname + '/videos/' + mostRecent.file.slice(0, -5) + '.mp4';
  const child = spawnSync('ffmpeg', ['-framerate', '30', '-i', mostRecent.full, '-c', 'copy', newFile]);
  return {'filepath' : newFile, 'filename' : mostRecent.file.slice(0, -5)};
}

const app = express();
app.get('/', function(req, res) {
  // res.sendFile(path.join(__dirname + '/index.html'));
  const video = getMostRecent();
  // res.set('Content-Type', 'text/html');
  res.send(`<h1>Video Recorded at ${video.name.replace('$-g', ':')} EST</h1>
      <video id="videoPlayer" controls>
        <source src="http://localhost:8080/video/" type="video/mp4">
      </video>`);
});
app.get('/video/', function(req, res) {
    const video = convertFile();
    fs.createReadStream(video.filepath).pipe(res);
});
app.listen(8080);
