/* Add other includes for necessary files here */
const video = require('../controllers/video.server.controller.js');

/* This module handles the routes for our videos. */
module.exports = function(app) {
  /* Add other request middlewear here */
  app.get('/video/:videoName', video.serve);
  app.param('videoName', video.videoName);
}
