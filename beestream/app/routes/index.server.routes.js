/* This module handles the routes for our index. */
module.exports = function(app) {
  /* Add other includes for necessary files here */
  const index = require('../controllers/index.server.controller.js');
  /* Add other request middlewear here */
  app.get('/*', index.render);
}
