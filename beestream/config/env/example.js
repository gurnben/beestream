module.exports = {
  //our database address
  db : 'mongodb://localhost/beeDB',
  //Path to the directory containing hive folders
  videoPath: '',
  //Path to the ffmpeg installation
  ffmpegPath: '',
  //The port to run the server on.
  port: 80,
  //All the datasets provded by the datapaths for the dashboard page.  
  dataSets: [
    "dataset"
  ]
};
