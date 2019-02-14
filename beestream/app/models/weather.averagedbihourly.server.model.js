const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.model('Weather_AverageBiHourly', new Schema({
  AverageTemperature: {
    type: Number
  },
  AverageHumidity: {
    type: Number
  },
  AverageWindspeed: {
    type: Number
  },
  MinimumTemperature: {
    type: Number
  },
  MinimumHumidity: {
    type: Number
  },
  MinimumWindspeed: {
    type: Number
  },
  MaximumTemperature: {
    type: Number
  },
  MaximumHumidity: {
    type: Number
  },
  MaximumWindspeed: {
    type: Number
  },
  UTCStartDate: {
    type: Date
  },
  UTCEndDate: {
    type: Date
  }
}), 'Weather_AverageBiHourly');
