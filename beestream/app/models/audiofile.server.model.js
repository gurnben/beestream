const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.model('AudioFiles', new Schema({
  HiveName: {
    type: String
  },
  UTCDate: {
    type: Date
  },
  FilePath: {
    type: String
  },
  RMSLinear: {
    type: Number
  }
}), 'AudioFiles');
