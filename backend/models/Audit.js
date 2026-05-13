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
    default: 'Model API'
  },
  monthlyRequests: {
    type: Number,
    default: 0
  },
  avgTokens: {
    type: Number,
    default: 0
  },
  modelTier: {
    type: String,
    enum: ['premium', 'balanced', 'economy', 'mixed', 'unknown'],
    default: 'unknown'
  },
  caching: {
    type: String,
    enum: ['none', 'partial', 'good', 'unknown'],
    default: 'unknown'
  },
  owner: {
    type: String,
    default: ''
  }
}, { _id: false });

const wasteFindingSchema = new mongoose.Schema({
  title: String,
  detail: String,
  category: String,
  impact: String,
  estimatedSavings: {
    type: Number,
    default: 0
  }
}, { _id: false });

const actionPlanSchema = new mongoose.Schema({
  phase: String,
  title: String,
  detail: String,
  owner: String,
  status: {
    type: String,
    enum: ['todo', 'doing', 'done'],
    default: 'todo'
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
  productType: {
    type: String,
    default: ''
  },
  teamSize: {
    type: Number,
    default: 1
  },
  monthlyActiveUsers: {
    type: Number,
    default: 0
  },
  monthlyRequests: {
    type: Number,
    default: 0
  },
  costConcern: {
    type: String,
    default: ''
  },
  dataSource: {
    type: String,
    default: ''
  },
  hasCaching: {
    type: String,
    enum: ['yes', 'partial', 'no', 'unknown'],
    default: 'unknown'
  },
  hasModelRouting: {
    type: String,
    enum: ['yes', 'partial', 'no', 'unknown'],
    default: 'unknown'
  },
  hasUsageLimits: {
    type: String,
    enum: ['yes', 'partial', 'no', 'unknown'],
    default: 'unknown'
  },
  hasCostAttribution: {
    type: String,
    enum: ['yes', 'partial', 'no', 'unknown'],
    default: 'unknown'
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
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  wasteFindings: [wasteFindingSchema],
  actionPlan: [actionPlanSchema],
  confirmedMonthlySavings: {
    type: Number,
    default: 0
  },
  implementationNotes: {
    type: String,
    default: ''
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
