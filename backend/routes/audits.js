const express = require('express');
const crypto = require('crypto');
const Audit = require('../models/Audit');
const { requireAuth, requireActivePlan, requireEditor, getAccessRole, hasCapability } = require('../middleware/auth');
const { calculateAudit } = require('../utils/costEngine');

const router = express.Router();

const cleanText = (value, maxLength = 500) =>
  String(value || '').trim().slice(0, maxLength);

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeChoice = (value) =>
  ['yes', 'partial', 'no', 'unknown'].includes(value) ? value : 'unknown';

const normalizeApprovalStatus = (value) =>
  ['not_requested', 'pending', 'approved', 'changes_requested'].includes(value)
    ? value
    : 'pending';

const normalizeProofStatus = (value) =>
  ['not_started', 'collecting', 'verified', 'case_study_ready'].includes(value)
    ? value
    : 'collecting';

const normalizeCadence = (value) =>
  ['none', 'monthly', 'quarterly'].includes(value) ? value : 'monthly';

const currentReviewPeriod = () =>
  new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

const nextReviewDate = (cadence) => {
  if (cadence === 'none') return undefined;

  const date = new Date();
  date.setHours(9, 0, 0, 0);
  date.setMonth(date.getMonth() + (cadence === 'quarterly' ? 3 : 1));
  return date;
};

const addAuditLog = (audit, req, event, detail = '') => {
  audit.auditLog = audit.auditLog || [];
  audit.auditLog.unshift({
    event,
    detail,
    actorName: req.user?.name || 'System',
    actorRole: getAccessRole(req.user),
    createdAt: new Date()
  });
  audit.auditLog = audit.auditLog.slice(0, 80);
};

const matchesFilter = (audit, filters) => {
  const values = {
    department: audit.department,
    region: audit.region,
    costCenter: audit.costCenter,
    status: audit.status,
    riskLevel: audit.riskLevel,
    reviewCadence: audit.reviewCadence
  };

  if (filters.department && values.department !== filters.department) return false;
  if (filters.region && values.region !== filters.region) return false;
  if (filters.costCenter && values.costCenter !== filters.costCenter) return false;
  if (filters.status && values.status !== filters.status) return false;
  if (filters.riskLevel && values.riskLevel !== filters.riskLevel) return false;
  if (filters.reviewCadence && values.reviewCadence !== filters.reviewCadence) return false;

  if (filters.owner) {
    const ownerMatch = (audit.tools || []).some((tool) => tool.owner === filters.owner) ||
      (audit.actionPlan || []).some((action) => action.owner === filters.owner);
    if (!ownerMatch) return false;
  }

  if (filters.search) {
    const haystack = [
      audit.companyName,
      audit.organizationName,
      audit.workspaceName,
      audit.businessType,
      audit.productType,
      audit.department,
      audit.region,
      audit.costCenter,
      ...(audit.tools || []).flatMap((tool) => [tool.name, tool.provider, tool.workflow, tool.customer, tool.owner])
    ].join(' ').toLowerCase();
    if (!haystack.includes(filters.search.toLowerCase())) return false;
  }

  return true;
};

const buildFacets = (audits) => {
  const owners = new Set();
  audits.forEach((audit) => {
    (audit.tools || []).forEach((tool) => {
      if (tool.owner) owners.add(tool.owner);
    });
    (audit.actionPlan || []).forEach((action) => {
      if (action.owner) owners.add(action.owner);
    });
  });

  const collect = (getter) => [...new Set(audits.map(getter).filter(Boolean))].sort();

  return {
    departments: collect((audit) => audit.department),
    regions: collect((audit) => audit.region),
    costCenters: collect((audit) => audit.costCenter),
    owners: [...owners].sort(),
    statuses: collect((audit) => audit.status),
    riskLevels: collect((audit) => audit.riskLevel),
    reviewCadences: collect((audit) => audit.reviewCadence)
  };
};

const approvalSummary = (audits) => audits.reduce((summary, audit) => {
  ['finance', 'engineering', 'leadership'].forEach((step) => {
    const status = audit.approval?.[step]?.status || 'not_requested';
    summary[status] = (summary[status] || 0) + 1;
  });
  return summary;
}, { not_requested: 0, pending: 0, approved: 0, changes_requested: 0 });

const proofSummary = (audits) => audits.reduce((summary, audit) => {
  const status = audit.proof?.status || 'not_started';
  summary[status] = (summary[status] || 0) + 1;
  summary.verifiedReports += ['verified', 'case_study_ready'].includes(status) ? 1 : 0;
  summary.caseStudyApproved += audit.proof?.permissionToUse ? 1 : 0;
  summary.verifiedMonthlySavings += audit.proof?.verifiedMonthlySavings || 0;
  return summary;
}, {
  not_started: 0,
  collecting: 0,
  verified: 0,
  case_study_ready: 0,
  verifiedReports: 0,
  caseStudyApproved: 0,
  verifiedMonthlySavings: 0
});

const publicProof = (proof = {}) => {
  if (!proof.permissionToUse) {
    return {
      status: proof.status || 'not_started',
      permissionToUse: false
    };
  }

  return {
    status: proof.status || 'not_started',
    baselinePeriod: proof.baselinePeriod || '',
    comparisonPeriod: proof.comparisonPeriod || '',
    baselineSpend: proof.baselineSpend || 0,
    verifiedSpendAfter: proof.verifiedSpendAfter || 0,
    verifiedMonthlySavings: proof.verifiedMonthlySavings || 0,
    validationMethod: proof.validationMethod || '',
    evidenceNotes: proof.evidenceNotes || '',
    verifiedBy: proof.verifiedBy || '',
    customerQuote: proof.customerQuote || '',
    quoteAuthor: proof.quoteAuthor || '',
    permissionToUse: true,
    caseStudyTitle: proof.caseStudyTitle || '',
    updatedAt: proof.updatedAt
  };
};

const buildEnterprisePack = (audit) => {
  const tools = audit.tools || [];
  const proof = audit.proof || {};
  const vendors = Object.values(tools.reduce((groups, tool) => {
    const name = tool.provider || tool.name || 'Unknown vendor';
    if (!groups[name]) groups[name] = { name, spend: 0, workflows: new Set(), owners: new Set() };
    groups[name].spend += tool.monthlyCost || 0;
    if (tool.workflow) groups[name].workflows.add(tool.workflow);
    if (tool.owner) groups[name].owners.add(tool.owner);
    return groups;
  }, {})).map((vendor) => ({
    ...vendor,
    workflows: [...vendor.workflows].join(', ') || 'Not tagged',
    owners: [...vendor.owners].join(', ') || 'No owner'
  })).sort((a, b) => b.spend - a.spend);

  const approval = audit.approval || {};
  const approvalLine = ['finance', 'engineering', 'leadership']
    .map((step) => `${step}: ${approval[step]?.status || 'not_requested'}`)
    .join(' | ');

  return {
    boardSummary: {
      title: `${audit.companyName} AI cost governance summary`,
      narrative: `${audit.organizationName || audit.companyName} is tracking ${audit.monthlySpend || 0} in monthly AI and infrastructure spend with ${audit.possibleMonthlySavings || 0} possible monthly savings. Current risk is ${audit.riskLevel || 'Medium'} and approval posture is ${approvalLine}.`,
      metrics: [
        ['Monthly spend', audit.monthlySpend || 0],
        ['Possible monthly savings', audit.possibleMonthlySavings || 0],
        ['Possible yearly savings', audit.yearlySavings || 0],
        ['Confirmed monthly savings', audit.confirmedMonthlySavings || 0]
      ]
    },
    procurementBrief: vendors.slice(0, 6).map((vendor) => ({
      vendor: vendor.name,
      spend: vendor.spend,
      workflows: vendor.workflows,
      owners: vendor.owners,
      negotiationAngle: vendor.spend >= (audit.monthlySpend || 0) * 0.3
        ? 'High concentration vendor. Review committed-use discounts, model routing alternatives, and volume tiers.'
        : 'Review usage, retention, and owner accountability before renewal.'
    })),
    riskRegister: [
      ...(audit.budgetAlerts || []).map((alert) => ({
        risk: alert.title,
        severity: alert.severity,
        owner: audit.department || 'Operations',
        mitigation: alert.detail
      })),
      ...(audit.wasteFindings || []).slice(0, 5).map((finding) => ({
        risk: finding.title,
        severity: finding.impact,
        owner: audit.department || 'Engineering',
        mitigation: finding.detail
      }))
    ].slice(0, 8),
    executiveActions: (audit.actionPlan || []).slice(0, 6).map((action) => ({
      phase: action.phase,
      action: action.title,
      owner: action.owner || 'Unassigned',
      status: action.status || 'todo'
    })),
    monthlyReview: {
      cadence: audit.reviewCadence || 'monthly',
      reviewPeriod: audit.reviewPeriod || currentReviewPeriod(),
      nextReviewAt: audit.nextReviewAt,
      recurringReport: Boolean(audit.recurringReport)
    },
    proof: {
      status: proof.status || 'not_started',
      baselinePeriod: proof.baselinePeriod || '',
      comparisonPeriod: proof.comparisonPeriod || '',
      baselineSpend: proof.baselineSpend || audit.monthlySpend || 0,
      verifiedSpendAfter: proof.verifiedSpendAfter || audit.confirmedSpendAfter || 0,
      verifiedMonthlySavings: proof.verifiedMonthlySavings || audit.confirmedMonthlySavings || 0,
      validationMethod: proof.validationMethod || '',
      evidenceNotes: proof.evidenceNotes || '',
      verifiedBy: proof.verifiedBy || '',
      customerQuote: proof.permissionToUse ? proof.customerQuote || '' : '',
      caseStudyReady: proof.status === 'case_study_ready' && Boolean(proof.permissionToUse)
    }
  };
};

const getPublicAudit = (audit) => ({
  _id: audit._id,
  companyName: audit.companyName,
  organizationName: audit.organizationName,
  department: audit.department,
  region: audit.region,
  costCenter: audit.costCenter,
  businessType: audit.businessType,
  workspaceName: audit.workspaceName,
  productType: audit.productType,
  teamSize: audit.teamSize,
  monthlyActiveUsers: audit.monthlyActiveUsers,
  monthlyRequests: audit.monthlyRequests,
  monthlyBudget: audit.monthlyBudget,
  costConcern: audit.costConcern,
  dataSource: audit.dataSource,
  tools: audit.tools,
  monthlySpend: audit.monthlySpend,
  possibleMonthlySavings: audit.possibleMonthlySavings,
  spendAfterCleanup: audit.spendAfterCleanup,
  yearlySavings: audit.yearlySavings,
  riskLevel: audit.riskLevel,
  wasteFindings: audit.wasteFindings,
  budgetAlerts: audit.budgetAlerts,
  unitEconomics: audit.unitEconomics,
  approval: audit.approval,
  proof: publicProof(audit.proof),
  actionPlan: audit.actionPlan,
  confirmedMonthlySavings: audit.confirmedMonthlySavings,
  confirmedSpendAfter: audit.confirmedSpendAfter,
  recommendations: audit.recommendations,
  status: audit.status,
  createdAt: audit.createdAt,
  updatedAt: audit.updatedAt
});

router.get('/shared/:token', async (req, res, next) => {
  try {
    const token = cleanText(req.params.token, 120);
    const audit = await Audit.findOne({ reportToken: token, reportShared: true });

    if (!audit) {
      return res.status(404).json({ message: 'Shared report not found' });
    }

    res.json({ audit: getPublicAudit(audit) });
  } catch (error) {
    next(error);
  }
});

router.use(requireAuth);

router.get('/stats', async (req, res, next) => {
  try {
    const allAudits = await Audit.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(120);
    const filters = {
      department: cleanText(req.query.department, 120),
      region: cleanText(req.query.region, 120),
      costCenter: cleanText(req.query.costCenter, 120),
      owner: cleanText(req.query.owner, 120),
      status: cleanText(req.query.status, 40),
      riskLevel: cleanText(req.query.riskLevel, 40),
      reviewCadence: cleanText(req.query.reviewCadence, 40),
      search: cleanText(req.query.search, 120)
    };
    const audits = allAudits.filter((audit) => matchesFilter(audit, filters)).slice(0, 40);
    const monthlySpend = audits.reduce((sum, audit) => sum + audit.monthlySpend, 0);
    const possibleMonthlySavings = audits.reduce((sum, audit) => sum + audit.possibleMonthlySavings, 0);
    const confirmedMonthlySavings = audits.reduce((sum, audit) => sum + (audit.confirmedMonthlySavings || 0), 0);
    const monthlyBudget = audits.reduce((sum, audit) => sum + (audit.monthlyBudget || 0), 0);
    const activeAlerts = audits.reduce((sum, audit) => sum + (audit.budgetAlerts?.length || 0), 0);
    const recurringReports = audits.filter((audit) => audit.recurringReport || audit.reviewCadence !== 'none').length;
    const dueReviews = audits.filter((audit) => audit.nextReviewAt && new Date(audit.nextReviewAt).getTime() <= Date.now()).length;
    const departments = audits.reduce((groups, audit) => {
      const name = audit.department || 'Unassigned';
      if (!groups[name]) groups[name] = { name, reports: 0, monthlySpend: 0, possibleMonthlySavings: 0 };
      groups[name].reports += 1;
      groups[name].monthlySpend += audit.monthlySpend || 0;
      groups[name].possibleMonthlySavings += audit.possibleMonthlySavings || 0;
      return groups;
    }, {});
    const regions = audits.reduce((groups, audit) => {
      const name = audit.region || 'Global';
      if (!groups[name]) groups[name] = { name, reports: 0, monthlySpend: 0, possibleMonthlySavings: 0 };
      groups[name].reports += 1;
      groups[name].monthlySpend += audit.monthlySpend || 0;
      groups[name].possibleMonthlySavings += audit.possibleMonthlySavings || 0;
      return groups;
    }, {});
    const workspaceMap = audits.reduce((groups, audit) => {
      const name = audit.workspaceName || audit.companyName || 'Workspace';
      if (!groups[name]) {
        groups[name] = { name, audits: 0, monthlySpend: 0, possibleMonthlySavings: 0, confirmedMonthlySavings: 0 };
      }
      groups[name].audits += 1;
      groups[name].monthlySpend += audit.monthlySpend || 0;
      groups[name].possibleMonthlySavings += audit.possibleMonthlySavings || 0;
      groups[name].confirmedMonthlySavings += audit.confirmedMonthlySavings || 0;
      return groups;
    }, {});
    const actionTotals = audits.reduce((totals, audit) => {
      (audit.actionPlan || []).forEach((action) => {
        totals.total += 1;
        if (action.status === 'done') totals.done += 1;
      });
      return totals;
    }, { total: 0, done: 0 });

    res.json({
      stats: {
        totalAudits: audits.length,
        monthlySpend,
        possibleMonthlySavings,
        yearlySavings: possibleMonthlySavings * 12,
        confirmedMonthlySavings,
        confirmedYearlySavings: confirmedMonthlySavings * 12,
        monthlyBudget,
        activeAlerts,
        approvalSummary: approvalSummary(audits),
        proofSummary: proofSummary(audits),
        recurringReports,
        dueReviews,
        actionCompletionRate: actionTotals.total
          ? Math.round((actionTotals.done / actionTotals.total) * 100)
          : 0
      },
      workspaces: Object.values(workspaceMap).sort((a, b) => b.monthlySpend - a.monthlySpend),
      departments: Object.values(departments).sort((a, b) => b.monthlySpend - a.monthlySpend),
      regions: Object.values(regions).sort((a, b) => b.monthlySpend - a.monthlySpend),
      facets: buildFacets(allAudits),
      filters,
      audits
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const audits = await Audit.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ audits });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireActivePlan, requireEditor, async (req, res, next) => {
  try {
    const {
      companyName,
      organizationName,
      department,
      region,
      costCenter,
      businessType,
      workspaceName,
      productType,
      teamSize,
      monthlyActiveUsers,
      monthlyRequests,
      monthlyBudget,
      targetSavingsRate,
      costConcern,
      dataSource,
      reviewCadence,
      hasCaching,
      hasModelRouting,
      hasUsageLimits,
      hasCostAttribution,
      tools,
      notes
    } = req.body;

    if (!companyName || !businessType) {
      return res.status(400).json({ message: 'Company name and business type are required' });
    }

    if (!Array.isArray(tools) || !tools.some((tool) => String(tool?.name || '').trim())) {
      return res.status(400).json({ message: 'Add at least one AI cost line to create an audit' });
    }

    const intake = {
      companyName: cleanText(companyName, 120),
      organizationName: cleanText(organizationName || req.user.organizationName || req.user.companyName || companyName, 120),
      department: cleanText(department || req.user.department, 120),
      region: cleanText(region || req.user.region, 120),
      costCenter: cleanText(costCenter, 120),
      businessType: cleanText(businessType, 120),
      workspaceName: cleanText(workspaceName, 120),
      productType: cleanText(productType, 120),
      teamSize: Math.max(1, Math.round(toNumber(teamSize) || 1)),
      monthlyActiveUsers: Math.max(0, Math.round(toNumber(monthlyActiveUsers))),
      monthlyRequests: Math.max(0, Math.round(toNumber(monthlyRequests))),
      monthlyBudget: Math.max(0, Math.round(toNumber(monthlyBudget))),
      targetSavingsRate: Math.max(0, Math.min(90, Math.round(toNumber(targetSavingsRate)))),
      costConcern: cleanText(costConcern, 500),
      dataSource: cleanText(dataSource, 160),
      reviewCadence: normalizeCadence(reviewCadence),
      reviewPeriod: currentReviewPeriod(),
      nextReviewAt: nextReviewDate(normalizeCadence(reviewCadence)),
      hasCaching: normalizeChoice(hasCaching),
      hasModelRouting: normalizeChoice(hasModelRouting),
      hasUsageLimits: normalizeChoice(hasUsageLimits),
      hasCostAttribution: normalizeChoice(hasCostAttribution),
      notes: cleanText(notes, 1000)
    };

    const result = calculateAudit({ tools, ...intake });
    const audit = await Audit.create({
      user: req.user._id,
      ...intake,
      ...result,
      auditLog: [{
        event: 'Report created',
        detail: 'Initial governance report created from spend data.',
        actorName: req.user.name || 'User',
        actorRole: getAccessRole(req.user),
        createdAt: new Date()
      }]
    });

    res.status(201).json({ audit });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const audit = await Audit.findOne({ _id: req.params.id, user: req.user._id });
    if (!audit) {
      return res.status(404).json({ message: 'Audit not found' });
    }
    res.json({ audit });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', requireEditor, async (req, res, next) => {
  try {
    const status = ['draft', 'review_ready', 'delivered'].includes(req.body.status)
      ? req.body.status
      : 'review_ready';

    const audit = await Audit.findOne({ _id: req.params.id, user: req.user._id });

    if (!audit) {
      return res.status(404).json({ message: 'Audit not found' });
    }

    audit.status = status;
    addAuditLog(audit, req, 'Status updated', `Report status changed to ${status}.`);
    await audit.save();

    res.json({ audit });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/share', requireActivePlan, requireEditor, async (req, res, next) => {
  try {
    const audit = await Audit.findOne({ _id: req.params.id, user: req.user._id });

    if (!audit) {
      return res.status(404).json({ message: 'Audit not found' });
    }

    audit.reportShared = true;
    audit.reportToken = audit.reportToken || crypto.randomBytes(24).toString('hex');
    audit.reportSharedAt = new Date();
    addAuditLog(audit, req, 'Private link enabled', 'A private public report link was created or refreshed.');
    await audit.save();

    res.json({ audit, shareUrl: `/reports/public/${audit.reportToken}` });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/share', requireActivePlan, requireEditor, async (req, res, next) => {
  try {
    const audit = await Audit.findOne({ _id: req.params.id, user: req.user._id });

    if (!audit) {
      return res.status(404).json({ message: 'Audit not found' });
    }

    audit.reportShared = false;
    addAuditLog(audit, req, 'Private link disabled', 'The private public report link was disabled.');
    await audit.save();

    res.json({ audit });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/action-plan/:index', requireEditor, async (req, res, next) => {
  try {
    const status = ['todo', 'doing', 'done'].includes(req.body.status)
      ? req.body.status
      : 'todo';
    const index = Number(req.params.index);

    if (!Number.isInteger(index) || index < 0) {
      return res.status(400).json({ message: 'Invalid action index' });
    }

    const audit = await Audit.findOne({ _id: req.params.id, user: req.user._id });

    if (!audit || !audit.actionPlan?.[index]) {
      return res.status(404).json({ message: 'Action item not found' });
    }

    audit.actionPlan[index].status = status;
    addAuditLog(audit, req, 'Action updated', `${audit.actionPlan[index].title} moved to ${status}.`);
    await audit.save();

    res.json({ audit });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/progress', requireEditor, async (req, res, next) => {
  try {
    const confirmedSpendAfter = Math.max(0, toNumber(req.body.confirmedSpendAfter));
    const explicitSavings = Math.max(0, toNumber(req.body.confirmedMonthlySavings));
    const audit = await Audit.findOne({ _id: req.params.id, user: req.user._id });

    if (!audit) {
      return res.status(404).json({ message: 'Audit not found' });
    }

    audit.confirmedSpendAfter = confirmedSpendAfter;
    audit.confirmedMonthlySavings = explicitSavings ||
      (confirmedSpendAfter ? Math.max(0, audit.monthlySpend - confirmedSpendAfter) : 0);
    audit.implementationNotes = cleanText(req.body.implementationNotes, 1200);
    addAuditLog(audit, req, 'Savings progress recorded', `${audit.confirmedMonthlySavings} confirmed monthly savings recorded.`);
    await audit.save();

    res.json({ audit });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/proof', requireEditor, async (req, res, next) => {
  try {
    const audit = await Audit.findOne({ _id: req.params.id, user: req.user._id });

    if (!audit) {
      return res.status(404).json({ message: 'Audit not found' });
    }

    const baselineSpend = Math.max(0, toNumber(req.body.baselineSpend || audit.monthlySpend));
    const verifiedSpendAfter = Math.max(0, toNumber(req.body.verifiedSpendAfter));
    const explicitSavings = Math.max(0, toNumber(req.body.verifiedMonthlySavings));
    const calculatedSavings = baselineSpend && verifiedSpendAfter
      ? Math.max(0, baselineSpend - verifiedSpendAfter)
      : 0;
    const verifiedMonthlySavings = explicitSavings || calculatedSavings;
    const status = normalizeProofStatus(req.body.status);

    audit.proof = {
      ...(audit.proof?.toObject?.() || audit.proof || {}),
      status,
      baselinePeriod: cleanText(req.body.baselinePeriod, 80),
      comparisonPeriod: cleanText(req.body.comparisonPeriod, 80),
      baselineSpend,
      verifiedSpendAfter,
      verifiedMonthlySavings,
      validationMethod: cleanText(req.body.validationMethod, 500),
      evidenceNotes: cleanText(req.body.evidenceNotes, 1200),
      evidenceLink: cleanText(req.body.evidenceLink, 500),
      verifiedBy: cleanText(req.body.verifiedBy || req.user.name, 120),
      customerQuote: cleanText(req.body.customerQuote, 800),
      quoteAuthor: cleanText(req.body.quoteAuthor, 160),
      permissionToUse: Boolean(req.body.permissionToUse),
      caseStudyTitle: cleanText(req.body.caseStudyTitle, 160),
      updatedAt: new Date()
    };

    if (['verified', 'case_study_ready'].includes(status)) {
      audit.confirmedSpendAfter = verifiedSpendAfter || audit.confirmedSpendAfter;
      audit.confirmedMonthlySavings = verifiedMonthlySavings || audit.confirmedMonthlySavings;
    }

    addAuditLog(audit, req, 'Proof updated', `${status} proof recorded with ${verifiedMonthlySavings} verified monthly savings.`);
    await audit.save();

    res.json({ audit });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/approval', requireEditor, async (req, res, next) => {
  try {
    const step = ['finance', 'engineering', 'leadership'].includes(req.body.step)
      ? req.body.step
      : '';

    if (!step) {
      return res.status(400).json({ message: 'Approval step is required' });
    }

    const capability = `approve_${step}`;
    const status = normalizeApprovalStatus(req.body.status);

    if (['approved', 'changes_requested'].includes(status) && !hasCapability(req.user, capability)) {
      return res.status(403).json({ message: `Your role cannot decide ${step} approval` });
    }

    const audit = await Audit.findOne({ _id: req.params.id, user: req.user._id });

    if (!audit) {
      return res.status(404).json({ message: 'Audit not found' });
    }

    audit.approval = audit.approval || {};
    audit.approval[step] = {
      ...(audit.approval[step]?.toObject?.() || audit.approval[step] || {}),
      status,
      owner: cleanText(req.body.owner, 120),
      notes: cleanText(req.body.notes, 800),
      decidedBy: ['approved', 'changes_requested'].includes(status) ? req.user.name : '',
      decidedAt: ['approved', 'changes_requested'].includes(status) ? new Date() : undefined
    };

    addAuditLog(audit, req, 'Approval updated', `${step} approval changed to ${status}.`);
    await audit.save();

    res.json({ audit });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/monthly-review', requireActivePlan, requireEditor, async (req, res, next) => {
  try {
    const source = await Audit.findOne({ _id: req.params.id, user: req.user._id });

    if (!source) {
      return res.status(404).json({ message: 'Audit not found' });
    }

    const period = cleanText(req.body.reviewPeriod, 80) || currentReviewPeriod();
    const sourceObject = source.toObject();
    delete sourceObject._id;
    delete sourceObject.createdAt;
    delete sourceObject.updatedAt;
    delete sourceObject.reportToken;
    delete sourceObject.reportSharedAt;

    const review = await Audit.create({
      ...sourceObject,
      user: req.user._id,
      reportShared: false,
      reportToken: '',
      parentAudit: source._id,
      recurringReport: true,
      reviewPeriod: period,
      reviewCadence: normalizeCadence(req.body.reviewCadence || source.reviewCadence),
      nextReviewAt: nextReviewDate(normalizeCadence(req.body.reviewCadence || source.reviewCadence)),
      status: 'draft',
      proof: {
        status: 'collecting',
        baselinePeriod: source.reviewPeriod || '',
        baselineSpend: source.monthlySpend || 0
      },
      approval: {
        finance: { status: 'pending', owner: source.approval?.finance?.owner || '' },
        engineering: { status: 'pending', owner: source.approval?.engineering?.owner || '' },
        leadership: { status: 'pending', owner: source.approval?.leadership?.owner || '' }
      },
      auditLog: [{
        event: 'Monthly review created',
        detail: `Recurring governance review created for ${period}.`,
        actorName: req.user.name || 'User',
        actorRole: getAccessRole(req.user),
        createdAt: new Date()
      }]
    });

    addAuditLog(source, req, 'Monthly review generated', `Created recurring review for ${period}.`);
    await source.save();

    res.status(201).json({ audit: review });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/audit-log', async (req, res, next) => {
  try {
    const audit = await Audit.findOne({ _id: req.params.id, user: req.user._id }).select('auditLog');

    if (!audit) {
      return res.status(404).json({ message: 'Audit not found' });
    }

    res.json({ auditLog: audit.auditLog || [] });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/enterprise-pack', async (req, res, next) => {
  try {
    if (!hasCapability(req.user, 'export')) {
      return res.status(403).json({ message: 'Your current role cannot export enterprise packs' });
    }

    const audit = await Audit.findOne({ _id: req.params.id, user: req.user._id });

    if (!audit) {
      return res.status(404).json({ message: 'Audit not found' });
    }

    res.json({ pack: buildEnterprisePack(audit) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
