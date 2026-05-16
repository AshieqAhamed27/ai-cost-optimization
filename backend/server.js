const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const auditRoutes = require('./routes/audits');
const agentRoutes = require('./routes/agent');
const paymentRoutes = require('./routes/payments');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 5001;

app.set('trust proxy', 1);
app.disable('x-powered-by');

const getRequiredEnv = (key) => {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`${key} is missing. Add it in the deployment environment variables.`);
  }

  if (key === 'JWT_SECRET' && value.length < 24) {
    throw new Error('JWT_SECRET must be at least 24 characters for secure account sessions.');
  }

  return value;
};

const getMongoUri = () => {
  const mongoUri = process.env.MONGO_URI?.trim();

  if (!mongoUri) {
    throw new Error('MONGO_URI is missing. Add your MongoDB connection string in the deployment environment variables.');
  }

  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    throw new Error('MONGO_URI must start with mongodb:// or mongodb+srv://.');
  }

  if (mongoUri.startsWith('mongodb+srv://')) {
    try {
      const { hostname } = new URL(mongoUri);
      const hostnameParts = hostname.split('.').filter(Boolean);

      if (hostname.endsWith('.') || hostnameParts.length < 3) {
        throw new Error(
          `MONGO_URI host looks incomplete: "${hostname}". Copy the full MongoDB Atlas host, including ".mongodb.net".`
        );
      }
    } catch (error) {
      if (error.message.includes('MONGO_URI host looks incomplete')) throw error;
      throw new Error('MONGO_URI is not a valid MongoDB connection string. Check the value copied from MongoDB Atlas.');
    }
  }

  return mongoUri;
};

const localFrontendOrigins = [
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:4174',
  'http://127.0.0.1:4174'
];

const productionFrontendOrigins = [
  'https://ai-cost-optimization.vercel.app'
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

const allowedOrigins = addLocalhostAlias([
  ...localFrontendOrigins,
  ...productionFrontendOrigins,
  ...configuredOrigins
]);
let mongoUri;

try {
  getRequiredEnv('JWT_SECRET');
  mongoUri = getMongoUri();
} catch (error) {
  console.error('Environment configuration failed:', error.message);
  process.exit(1);
}

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '4mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 220,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please wait a few minutes and try again.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login or signup attempts. Please wait a few minutes and try again.' }
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 45,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many payment attempts. Please wait a few minutes and try again.' }
});

const agentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 35,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many agent requests. Please wait a few minutes and try again.' }
});

app.use(apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'SpendGuard AI Cost Governance API',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/agent', agentLimiter, agentRoutes);
app.use('/api/payments', paymentLimiter, paymentRoutes);
app.use(errorHandler);

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => console.log(`API running on port ${port}`));
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    if (/querySrv ENOTFOUND/i.test(error.message)) {
      console.error('Check MONGO_URI in Render. The Atlas host should look like cluster-name.xxxxx.mongodb.net and must not be truncated.');
    }
    process.exit(1);
  });
