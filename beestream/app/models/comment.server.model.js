const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  'Username': {
    type: String,
    required: 'Username is required.',
    trim: true
  },
  'Comment': {
    type: String,
    required: 'Comment is required.',
    trim: true
  },
  'Hive': {
    type: String,
    required: 'Hive name is required!',
    trim: true
  },
  'UTCDate': {
    type: Date,
    required: 'A date is required to identify the related files.',
  },
  'FilePath': {
    type: String,
    required: 'Filepath is required',
    trim: true
  },
  'Created': {
    type: Date,
    required: true,
    default: Date.now
  }
});
mongoose.model('Comment', CommentSchema, 'Comments');
