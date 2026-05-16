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
  organizationName: {
    type: String,
    trim: true,
    default: ''
  },
  department: {
    type: String,
    trim: true,
    default: ''
  },
  region: {
    type: String,
    trim: true,
    default: ''
  },
  accessRole: {
    type: String,
    enum: ['admin', 'finance', 'engineering', 'leadership', 'auditor', 'viewer'],
    default: 'admin'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  activePlan: {
    type: String,
    enum: ['free', 'early_access', 'trial', 'mini_audit', 'business_audit', 'monthly_monitor'],
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
