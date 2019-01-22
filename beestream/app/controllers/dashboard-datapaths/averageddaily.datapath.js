const mongoose = require('mongoose');
const AverageTrafficByDay = mongoose.model('AverageTrafficByDay');
const utils = require('./datapath-utils.js');

module.exports = {
  name: 'byday',
  aggregateMethod: ' Averaged Daily',
  threshold: 2,
  query: async function(viewQuerySelection, hives, startDate, stopDate, callback) {
    utils.queryFromView(AverageTrafficByDay,
        hives, startDate, stopDate, viewQuerySelection, callback, ' Averaged Daily');
  }
}
