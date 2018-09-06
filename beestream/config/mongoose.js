const config = require('./config'); //The config file will prove our db path
const mongoose = require('mongoose');

/*This file will handle the mongoose database connection.
* @export: Gurney Buchanan <gurnben>
*
* @export: db object.  This is the mongoose database connection.
*/
module.exports = function() {
  const db = mongoose.connect(config.db, {useNewUrlParser: true }); //uses the db path from the config
  require('../app/models/comment.server.model.js');
  require('../app/models/tag.server.model.js');
  require('../app/models/videofile.server.model.js');
  require('../app/models/avaliabletags.server.model.js');
  //Any necessary models should be called here.
  return db;
}
