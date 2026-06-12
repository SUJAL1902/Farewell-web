const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['image', 'video'], required: true },
    filename: { type: String, required: true },
    originalName: { type: String },
    caption: { type: String, default: '' },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Media', mediaSchema);
