const express = require('express');
const Audit = require('../models/Audit');
const { requireAuth, requireActivePlan } = require('../middleware/auth');
const { calculateAudit } = require('../utils/costEngine');

const router = express.Router();

router.use(requireAuth);

router.get('/stats', async (req, res, next) => {
  try {
    const audits = await Audit.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    const monthlySpend = audits.reduce((sum, audit) => sum + audit.monthlySpend, 0);
    const possibleMonthlySavings = audits.reduce((sum, audit) => sum + audit.possibleMonthlySavings, 0);

    res.json({
      stats: {
        totalAudits: audits.length,
        monthlySpend,
        possibleMonthlySavings,
        yearlySavings: possibleMonthlySavings * 12
      },
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
    const { companyName, businessType, teamSize, tools, notes } = req.body;

    if (!companyName || !businessType) {
      return res.status(400).json({ message: 'Company name and business type are required' });
    }

    if (!Array.isArray(tools) || !tools.some((tool) => String(tool?.name || '').trim())) {
      return res.status(400).json({ message: 'Add at least one AI cost line to create an audit' });
    }

    const result = calculateAudit({ tools, teamSize });
    const audit = await Audit.create({
      user: req.user._id,
      companyName,
      businessType,
      teamSize,
      notes,
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

module.exports = router;
