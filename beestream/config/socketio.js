// Load the module dependencies
const config = require('./config');
const cookieParser = require('cookie-parser');
const configureArchive = require('../app/controllers/archive.server.controller.js');
const configureStream = require('../app/controllers/stream.server.controller.js');
const configureComment = require('../app/controllers/comment.server.controller.js');
const configureAnalysis = require('../app/controllers/analysis.server.controller.js');
/* TODO: Add SocketIO component controllers here */

// Define the Socket.io configuration method
module.exports = function(server, io) {
	// Add an event listener to the 'connection' event
  io.on('connection', (socket) => {
      configureArchive(io, socket);
      configureStream(io, socket);
      configureComment(io, socket);
      configureAnalysis(io, socket);
  });
};
