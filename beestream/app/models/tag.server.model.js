const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TagSchema = new Schema({
  Tag: {
    type: String,
    required: 'Tag type is required.',
    trim: true
  },
  Count: {
    type: Number,
    required: 'A count of tags is required',
    default: 0
  },
  HiveName: {
    type: String,
    required: 'Hive name is required!',
    trim: true
  },
  UTCDate: {
    type: Date,
    required: 'A date is required to identify the related files.',
  },
  FilePath: {
    type: String,
    required: 'Filepath is required',
    trim: true
  },
  Modified: {
    type: Date,
    required: true,
    default: Date.now
  }
});
mongoose.model('Tag', TagSchema, 'Tags');
