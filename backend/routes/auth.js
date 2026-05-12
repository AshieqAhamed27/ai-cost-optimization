const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const cleanText = (value, maxLength = 120) =>
  String(value || '').trim().slice(0, maxLength);

const normalizeEmail = (value) =>
  String(value || '').toLowerCase().trim();

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  companyName: user.companyName,
  role: user.role,
  activePlan: user.activePlan,
  planStatus: user.planStatus,
  paidAt: user.paidAt,
  trialStartedAt: user.trialStartedAt,
  trialEndsAt: user.trialEndsAt
});

const activateEarlyAccess = async (user) => {
  if (user.planStatus === 'active' && user.activePlan && user.activePlan !== 'free') {
    return user;
  }

  user.activePlan = 'early_access';
  user.planStatus = 'active';
  await user.save();
  return user;
};

router.post('/signup', async (req, res, next) => {
  try {
    const name = cleanText(req.body.name);
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const companyName = cleanText(req.body.companyName);

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      companyName,
      passwordHash,
      activePlan: 'early_access',
      planStatus: 'active'
    });

    res.status(201).json({
      token: signToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      token: signToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
});

router.post('/early-access/start', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const updatedUser = await activateEarlyAccess(user);

    res.json({
      message: 'Early access activated',
      user: publicUser(updatedUser)
    });
  } catch (error) {
    next(error);
  }
});

router.post('/trial/start', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const updatedUser = await activateEarlyAccess(user);

    res.json({
      message: 'Early access activated',
      user: publicUser(updatedUser)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
