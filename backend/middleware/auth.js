const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isTrialActive = (user) =>
  user?.planStatus === 'trial' &&
  user?.activePlan === 'trial' &&
  user?.trialEndsAt &&
  new Date(user.trialEndsAt).getTime() > Date.now();

const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.planStatus === 'trial' && !isTrialActive(user)) {
      await User.findByIdAndUpdate(user._id, {
        activePlan: 'free',
        planStatus: 'expired'
      });
      user.activePlan = 'free';
      user.planStatus = 'expired';
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireActivePlan = (req, res, next) => {
  if (req.user?.planStatus === 'active' && req.user?.activePlan && req.user.activePlan !== 'free') {
    return next();
  }

  if (isTrialActive(req.user)) {
    return next();
  }

  if (req.user?.planStatus === 'expired') {
    return res.status(402).json({
      message: 'Free pilot access is available. Activate the pilot to keep creating reports.'
    });
  }

  return res.status(402).json({
    message: 'Start the free pilot before creating governance reports'
  });
};

module.exports = { requireAuth, requireActivePlan, isTrialActive };
