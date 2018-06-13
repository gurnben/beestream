const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  username: {
    type: String,
    required: 'Username is required.',
    trim: true
  },
  comment: {
    type: String,
    required: 'Comment is required.',
    trim: true
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
  created: {
    type: Date,
    required: true,
    default: Date.now
  }
});
mongoose.model('Comment', CommentSchema);
