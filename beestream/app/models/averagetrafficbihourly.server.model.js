const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.model('AverageTrafficBiHourly', new Schema({
  HiveName: {
    type: String
  },
  AverageArrivals: {
    type: Number
  },
  AverageDepartures: {
    type: Number
  },
  AverageFileSize: {
    type: Number
  },
  MinimumArrivals: {
    type: Number
  },
  MinimumDepartures: {
    type: Number
  },
  MinimumFileSize: {
    type: Number
  },
  MaximumArrivals: {
    type: Number
  },
  MaximumDepartures: {
    type: Number
  },
  MaximumFileSize: {
    type: Number
  },
  UTCStartDate: {
    type: Date
  },
  UTCEndDate: {
    type: Date
  }
}), 'AverageTrafficBiHourly');
