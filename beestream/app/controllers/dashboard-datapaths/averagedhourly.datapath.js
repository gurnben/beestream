const mongoose = require('mongoose');
const AverageTrafficByHour = mongoose.model('AverageTrafficByHour');
const utils = require('./datapath-utils.js');

module.exports = {
  name: 'byhour',
  threshold: 12,
  query: async function(viewQuerySelection, hives, startDate, stopDate, callback) {
    utils.queryFromView(AverageTrafficByHour,
        hives, startDate, stopDate, viewQuerySelection, callback);
  }
}
