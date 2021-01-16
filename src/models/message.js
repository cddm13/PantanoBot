const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    textMessage: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
