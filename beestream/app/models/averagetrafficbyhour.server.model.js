const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.model('AverageTrafficByHour', new Schema({
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
  UTCHour: {
    type: Number
  },
  AverageArrivals: {
    type: Number
  },
  AverageDepartures: {
    type: Number
  }
}), 'AverageTrafficByHour');
