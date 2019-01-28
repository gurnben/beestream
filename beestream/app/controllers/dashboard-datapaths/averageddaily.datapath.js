const mongoose = require('mongoose');
const AverageTrafficByDay = mongoose.model('AverageTrafficByDay');
const Audio_AverageByDay = mongoose.model('Audio_AverageByDay');
const utils = require('./datapath-utils.js');

module.exports = {
  name: 'byday',
  aggregateMethod: ' Averaged Daily',
  threshold: 2,
  query: async function(viewQuerySelection, hives, startDate, stopDate, callback) {
    utils.queryFromView(AverageTrafficByDay, Audio_AverageByDay,
        hives, startDate, stopDate, viewQuerySelection, callback, ' Averaged Daily');
  }
}
