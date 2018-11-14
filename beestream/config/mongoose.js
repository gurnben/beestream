const config = require('./config'); //The config file will prove our db path
const mongoose = require('mongoose');

/*This file will handle the mongoose database connection.
* @export: Gurney Buchanan <gurnben>
*
* @export: db object.  This is the mongoose database connection.
*/
module.exports = function() {
  const db = mongoose.connect(config.db, {useNewUrlParser: true }); //uses the db path from the config
  //require all db configuration files.
  path = require('path').resolve("app/models/");
  require('fs').readdirSync(path).forEach((file) => {
    require(`../app/models/${file}`);
  });
  //Any necessary models should be called here.
  return db;
}
