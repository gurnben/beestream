/* What is our environment? Default to production. */
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Configure the Database
const db = require('./config/mongoose')();

// Configure the Express Application
const app = require('./config/express')(db);

//get the port to run on from the config file.
const port = require('./config/config.js').port;

app.listen(port);
module.exports = app; //Export the running application.
console.log(`Beestream running at http://localhost:${port}/ in ${process.env.NODE_ENV} mode.`); //TODO: edit to reflect the address of the server host.
