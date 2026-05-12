const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  activePlan: {
    type: String,
    enum: ['free', 'trial', 'mini_audit', 'business_audit', 'monthly_monitor'],
    default: 'free'
  },
  planStatus: {
    type: String,
    enum: ['free', 'trial', 'active', 'expired'],
    default: 'free'
  },
  trialStartedAt: Date,
  trialEndsAt: Date,
  paidAt: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
