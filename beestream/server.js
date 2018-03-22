/* What is our environment? Default to development. */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

/* Include our configuraitons for mongoose db and expressjs application */
const configureMongoose = require('./config/mongoose');
const configureExpress = require('./config/express');

// Configure the Database
const db = configureMongoose();

// Configure the Express Application
const app = configureExpress(db);
app.listen(3000);
module.exports = app; //Export the running application.
console.log('Beestream running at http://localhost:3000/'); //TODO: edit to reflect the address of the server host.
