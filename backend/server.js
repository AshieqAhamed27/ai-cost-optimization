const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const auditRoutes = require('./routes/audits');
const paymentRoutes = require('./routes/payments');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 5001;

const localFrontendOrigins = [
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:4174',
  'http://127.0.0.1:4174'
];

const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const addLocalhostAlias = (origins) => {
  const expanded = new Set();

  origins.forEach((origin) => {
    try {
      const url = new URL(origin);
      expanded.add(url.origin);

      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        url.hostname = url.hostname === 'localhost' ? '127.0.0.1' : 'localhost';
        expanded.add(url.origin);
      }
    } catch {
      expanded.add(origin);
    }
  });

  return expanded;
};

const allowedOrigins = addLocalhostAlias(configuredOrigins.length ? configuredOrigins : localFrontendOrigins);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 220,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'AI Cost Optimization API',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/payments', paymentRoutes);
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => console.log(`API running on port ${port}`));
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
