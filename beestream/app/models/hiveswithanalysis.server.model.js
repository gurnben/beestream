const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.model('HivesWithAnalysis', new Schema({
  HiveName: {
    type: String
  },
  StartDate: {
    type: Date
  },
  EndDate: {
    type: Date
  }
}), 'HivesWithAnalysis');
