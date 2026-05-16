const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  provider: {
    type: String,
    default: ''
  },
  modelName: {
    type: String,
    default: ''
  },
  workflow: {
    type: String,
    default: ''
  },
  customer: {
    type: String,
    default: ''
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
  },
  department: {
    type: String,
    default: ''
  },
  region: {
    type: String,
    default: ''
  },
  costCenter: {
    type: String,
    default: ''
  },
  budgetLimit: {
    type: Number,
    default: 0
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

const budgetAlertSchema = new mongoose.Schema({
  title: String,
  detail: String,
  severity: String,
  currentSpend: {
    type: Number,
    default: 0
  },
  threshold: {
    type: Number,
    default: 0
  }
}, { _id: false });

const approvalStepSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['not_requested', 'pending', 'approved', 'changes_requested'],
    default: 'not_requested'
  },
  owner: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  decidedBy: {
    type: String,
    default: ''
  },
  decidedAt: Date
}, { _id: false });

const approvalSchema = new mongoose.Schema({
  finance: {
    type: approvalStepSchema,
    default: () => ({})
  },
  engineering: {
    type: approvalStepSchema,
    default: () => ({})
  },
  leadership: {
    type: approvalStepSchema,
    default: () => ({})
  }
}, { _id: false });

const auditLogEntrySchema = new mongoose.Schema({
  event: {
    type: String,
    required: true
  },
  detail: {
    type: String,
    default: ''
  },
  actorName: {
    type: String,
    default: ''
  },
  actorRole: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const proofSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['not_started', 'collecting', 'verified', 'case_study_ready'],
    default: 'not_started'
  },
  baselinePeriod: {
    type: String,
    default: ''
  },
  comparisonPeriod: {
    type: String,
    default: ''
  },
  baselineSpend: {
    type: Number,
    default: 0
  },
  verifiedSpendAfter: {
    type: Number,
    default: 0
  },
  verifiedMonthlySavings: {
    type: Number,
    default: 0
  },
  validationMethod: {
    type: String,
    default: ''
  },
  evidenceNotes: {
    type: String,
    default: ''
  },
  evidenceLink: {
    type: String,
    default: ''
  },
  verifiedBy: {
    type: String,
    default: ''
  },
  customerQuote: {
    type: String,
    default: ''
  },
  quoteAuthor: {
    type: String,
    default: ''
  },
  permissionToUse: {
    type: Boolean,
    default: false
  },
  caseStudyTitle: {
    type: String,
    default: ''
  },
  updatedAt: Date
}, { _id: false });

const unitEconomicsSchema = new mongoose.Schema({
  costPerActiveUser: {
    type: Number,
    default: 0
  },
  costPerRequest: {
    type: Number,
    default: 0
  },
  topWorkflow: {
    type: String,
    default: ''
  },
  topWorkflowCost: {
    type: Number,
    default: 0
  },
  topCustomer: {
    type: String,
    default: ''
  },
  topCustomerCost: {
    type: Number,
    default: 0
  },
  unattributedSpend: {
    type: Number,
    default: 0
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
  organizationName: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  region: {
    type: String,
    default: ''
  },
  costCenter: {
    type: String,
    default: ''
  },
  workspaceName: {
    type: String,
    default: ''
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
  monthlyBudget: {
    type: Number,
    default: 0
  },
  targetSavingsRate: {
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
  reviewCadence: {
    type: String,
    enum: ['none', 'monthly', 'quarterly'],
    default: 'monthly'
  },
  reviewPeriod: {
    type: String,
    default: ''
  },
  nextReviewAt: Date,
  parentAudit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Audit'
  },
  recurringReport: {
    type: Boolean,
    default: false
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
  budgetAlerts: [budgetAlertSchema],
  approval: {
    type: approvalSchema,
    default: () => ({})
  },
  auditLog: [auditLogEntrySchema],
  proof: {
    type: proofSchema,
    default: () => ({})
  },
  unitEconomics: {
    type: unitEconomicsSchema,
    default: () => ({})
  },
  actionPlan: [actionPlanSchema],
  confirmedMonthlySavings: {
    type: Number,
    default: 0
  },
  confirmedSpendAfter: {
    type: Number,
    default: 0
  },
  implementationNotes: {
    type: String,
    default: ''
  },
  reportShared: {
    type: Boolean,
    default: false
  },
  reportToken: {
    type: String,
    default: '',
    index: true
  },
  reportSharedAt: {
    type: Date
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
