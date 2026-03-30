const mongoose = require('mongoose');

const profileViewSchema = new mongoose.Schema({
  viewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  viewed: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProfileView', profileViewSchema);
