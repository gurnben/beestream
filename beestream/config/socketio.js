// Load the module dependencies
const config = require('./config');
const cookieParser = require('cookie-parser');
/* TODO: Add SocketIO component controllers here */

// Define the Socket.io configuration method
module.exports = function(server, io, mongoStore) {
	// Intercept Socket.io's handshake request
    io.use((socket, next) => {
    	// Use the 'cookie-parser' module to parse the request cookies
        cookieParser(config.sessionSecret)(socket.request, {}, (err) => {
        	// Get the session id from the request cookies
            var sessionId = socket.request.signedCookies['connect.sid'];

            // Use the mongoStorage instance to get the Express session information
            mongoStore.get(sessionId, (err, session) => {
            	// Set the Socket.io session information
                socket.request.session = session;

                /* TODO: Configure or setup here */
            });
        });
    });

	// Add an event listener to the 'connection' event
    io.on('connection', (socket) => {
    	/* TODO: Load the necessary controllers here */
    });
};
