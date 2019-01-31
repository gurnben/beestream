const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.model('Audio_AverageBiHourly', new Schema({
  HiveName: {
    type: String
  },
  AverageRMSLinear: {
    type: Number
  },
  MinimumRMSLinear: {
    type: Number
  },
  MaximumRMSLinear: {
    type: Number
  },
  UTCStartDate: {
    type: Date
  },
  UTCEndDate: {
    type: Date
  }
}), 'Audio_AverageBiHourly');
