const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TagSchema = new Schema({
  tag: {
    type: String,
    required: 'Tag type is required.',
    trim: true
  },
  count: {
    type: Number,
    required: 'A count of tags is required',
    default: 0
  },
  hive: {
    type: String,
    required: 'Hive name is required!',
    trim: true
  },
  date: {
    type: Date,
    required: 'A date is required to identify the related files.',
  },
  modified: {
    type: Date,
    required: true,
    default: Date.now
  }
});
mongoose.model('Tag', TagSchema);
