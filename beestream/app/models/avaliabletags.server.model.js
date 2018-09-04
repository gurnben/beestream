const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TagSchema = new Schema({
  Tag: {
    type: String,
    required: 'Tag type is required.',
    trim: true
  }
});
mongoose.model('AvailableTag', TagSchema, 'AvailableTags');
