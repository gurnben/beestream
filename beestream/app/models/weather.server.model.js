const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.model('Weather', new Schema({
  "Date/Time (EST)": {
    type: Date
  },
  "2m Air Temperature (F)": {
    type: Number
  },
  "2m Calculated Wet Bulb Temp (F)": {
    type: Number
  },
  "2m Dewpoint Temperature (F)": {
    type: Number
  },
  "2m Relative Humidity (percent)": {
    type: Number
  },
  "2m Visibility (sm)": {
    type: Number
  },
  "Obscuration": {
    type: String
  },
  "20ft Calculated Log Wind Profile (mph)": {
    type: Number
  },
  "10m Wind Speed (mph)": {
    type: Number
  },
  "10m Wind Direction": {
    type: String
  },
  "Level 1 clouds": {
    type: String
  },
  "Level 2 clouds": {
    type: String
  },
  "Level 3 clouds": {
    type: String
  },
  "UTCDate": {
    type: Date
  },
  "2m Calculated Heat Index (F)": {
    type: Number
  },
  "Weather": {
    type: String
  },
  "10m Wind Gusts (mph)": {
    type: Number
  },
  "2m Hourly Precipitation (in)": {
    type: Number
  },
  "10m High value of wind variance (degrees)": {
    type: Number
  },
  "10m Low value of wind variance (degrees)": {
    type: Number
  }
}), 'Weather');
