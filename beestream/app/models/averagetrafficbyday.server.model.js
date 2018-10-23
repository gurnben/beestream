const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.model('AverageTrafficByDay', new Schema({
  HiveName: {
    type: String
  },
  UTCYear: {
    type: Number
  },
  UTCMonth: {
    type: Number
  },
  UTCDay: {
    type: Number
  },
  AverageArrivals: {
    type: Number
  },
  AverageDepartures: {
    type: Number
  }
}), 'AverageTrafficByDay');
