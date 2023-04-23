const mongoose = require('mongoose');

let model = mongoose.model('User', new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  likes: {
    type: [String],
    default: [],
  }
}))

module.exports = model;