const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

  return res.status(402).json({
    message: 'Choose a paid audit plan before creating client reports'
  });
};

module.exports = { requireAuth, requireActivePlan };
