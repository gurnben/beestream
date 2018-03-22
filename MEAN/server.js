process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const configureMongoose = require('./config/mongoose');
const configureExpress = require('./config/express');
const configurePassport = require('./config/passport');
const db = configureMongoose();
const app = configureExpress(db);
const passport = configurePassport();
app.listen(3000);
module.exports = app;
console.log('Server running at http://localhost:3000/');
