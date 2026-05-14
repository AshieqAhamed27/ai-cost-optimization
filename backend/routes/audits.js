const express = require('express');
const crypto = require('crypto');
const Audit = require('../models/Audit');
const { requireAuth, requireActivePlan } = require('../middleware/auth');
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

const getPublicAudit = (audit) => ({
  _id: audit._id,
  companyName: audit.companyName,
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
    const audits = await Audit.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    const monthlySpend = audits.reduce((sum, audit) => sum + audit.monthlySpend, 0);
    const possibleMonthlySavings = audits.reduce((sum, audit) => sum + audit.possibleMonthlySavings, 0);
    const confirmedMonthlySavings = audits.reduce((sum, audit) => sum + (audit.confirmedMonthlySavings || 0), 0);
    const monthlyBudget = audits.reduce((sum, audit) => sum + (audit.monthlyBudget || 0), 0);
    const activeAlerts = audits.reduce((sum, audit) => sum + (audit.budgetAlerts?.length || 0), 0);
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
        actionCompletionRate: actionTotals.total
          ? Math.round((actionTotals.done / actionTotals.total) * 100)
          : 0
      },
      workspaces: Object.values(workspaceMap).sort((a, b) => b.monthlySpend - a.monthlySpend),
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

router.post('/', requireActivePlan, async (req, res, next) => {
  try {
    const {
      companyName,
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
      ...result
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

router.patch('/:id/status', async (req, res, next) => {
  try {
    const status = ['draft', 'review_ready', 'delivered'].includes(req.body.status)
      ? req.body.status
      : 'review_ready';

    const audit = await Audit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true }
    );

    if (!audit) {
      return res.status(404).json({ message: 'Audit not found' });
    }

    res.json({ audit });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/share', requireActivePlan, async (req, res, next) => {
  try {
    const audit = await Audit.findOne({ _id: req.params.id, user: req.user._id });

    if (!audit) {
      return res.status(404).json({ message: 'Audit not found' });
    }

    audit.reportShared = true;
    audit.reportToken = audit.reportToken || crypto.randomBytes(24).toString('hex');
    audit.reportSharedAt = new Date();
    await audit.save();

    res.json({ audit, shareUrl: `/reports/public/${audit.reportToken}` });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/share', requireActivePlan, async (req, res, next) => {
  try {
    const audit = await Audit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { reportShared: false },
      { new: true }
    );

    if (!audit) {
      return res.status(404).json({ message: 'Audit not found' });
    }

    res.json({ audit });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/action-plan/:index', async (req, res, next) => {
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
    await audit.save();

    res.json({ audit });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/progress', async (req, res, next) => {
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
    await audit.save();

    res.json({ audit });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
