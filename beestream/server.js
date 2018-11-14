/* What is our environment? Default to development. */
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Configure the Database
const db = require('./config/mongoose')();

// Configure the Express Application
const app = require('./config/express')(db);

app.listen(3000);
module.exports = app; //Export the running application.
console.log(`Beestream running at http://localhost:3000/ in ${process.env.NODE_ENV} mode.`); //TODO: edit to reflect the address of the server host.
