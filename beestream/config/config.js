/*This file is incredibly simple, it handles exporting the correct config based
* on the NODE_ENV environment variable.  Note: the ./env/ directory should hold
* a .js file for each environment with the appropriate configuration.  This
* includes the database address and the session secret.
*/
module.exports = require('./env/' + process.env.NODE_ENV + '.js');
