const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  monthlyCost: {
    type: Number,
    default: 0
  },
  seats: {
    type: Number,
    default: 1
  },
  usage: {
    type: String,
    enum: ['high', 'medium', 'low', 'unused'],
    default: 'medium'
  },
  category: {
    type: String,
    default: 'AI tool'
  }
}, { _id: false });

const auditSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  businessType: {
    type: String,
    required: true,
    trim: true
  },
  teamSize: {
    type: Number,
    default: 1
  },
  tools: [toolSchema],
  monthlySpend: {
    type: Number,
    default: 0
  },
  possibleMonthlySavings: {
    type: Number,
    default: 0
  },
  spendAfterCleanup: {
    type: Number,
    default: 0
  },
  yearlySavings: {
    type: Number,
    default: 0
  },
  recommendations: [{
    title: String,
    detail: String,
    impact: String
  }],
  status: {
    type: String,
    enum: ['draft', 'review_ready', 'delivered'],
    default: 'review_ready'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Audit', auditSchema);

