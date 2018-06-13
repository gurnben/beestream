const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnalysisSchema = new Schema({
  hive: {
    type: String,
    required: 'Hive name is required!',
    trim: true
  },
  arrivals: {
    type: Number,
    required: 'Arrivals is required.'
  },
  departures: {
    type: Number,
    required: 'Departures is required.'
  },
  date: {
    type: Date,
    required: 'A date is required to identify the related files.',
  }
});
mongoose.model('Analysis', AnalysisSchema);
