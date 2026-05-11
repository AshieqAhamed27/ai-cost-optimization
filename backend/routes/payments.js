const crypto = require('crypto');
const express = require('express');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { plans, getPlan } = require('../utils/plans');

const router = express.Router();

const isPaymentSimulationEnabled = () =>
  process.env.PAYMENT_SIMULATION === 'true' &&
  process.env.ALLOW_PAYMENT_SIMULATION === 'true';

const createReceiptId = () =>
  `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const getGatewayErrorMessage = (error) =>
  error?.error?.description ||
  error?.error?.reason ||
  error?.description ||
  error?.message ||
  'Payment gateway request failed';

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

router.get('/plans', (req, res) => {
  res.json({ plans: Object.values(plans) });
});

router.post('/razorpay/order', requireAuth, async (req, res, next) => {
  try {
    const plan = getPlan(req.body.planId);
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const simulation = isPaymentSimulationEnabled();
    const razorpay = getRazorpay();

    if (simulation) {
      const payment = await Payment.create({
        user: req.user._id,
        planId: plan.id,
        amount: plan.amount,
        razorpayOrderId: `sim_order_${Date.now()}`,
        status: 'created'
      });

      return res.json({
        simulation: true,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_simulation',
        order: {
          id: payment.razorpayOrderId,
          amount: plan.amount * 100,
          currency: 'INR'
        },
        plan
      });
    }

    if (!razorpay) {
      return res.status(503).json({
        message: 'Payment gateway is not configured. Add Razorpay keys before accepting live payments.'
      });
    }

    let order;
    try {
      order = await razorpay.orders.create({
        amount: plan.amount * 100,
        currency: 'INR',
        receipt: createReceiptId(),
        notes: {
          userId: String(req.user._id),
          planId: plan.id
        }
      });
    } catch (error) {
      return res.status(error.statusCode || 502).json({
        message: getGatewayErrorMessage(error)
      });
    }

    await Payment.create({
      user: req.user._id,
      planId: plan.id,
      amount: plan.amount,
      razorpayOrderId: order.id,
      status: 'created'
    });

    res.json({
      simulation: false,
      keyId: process.env.RAZORPAY_KEY_ID,
      order,
      plan
    });
  } catch (error) {
    next(error);
  }
});

router.post('/razorpay/verify', requireAuth, async (req, res, next) => {
  try {
    const {
      planId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const plan = getPlan(planId);
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const allowSimulation = isPaymentSimulationEnabled();

    if (!allowSimulation) {
      if (!process.env.RAZORPAY_KEY_SECRET) {
        return res.status(503).json({ message: 'Payment verification is not configured' });
      }

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: 'Payment verification details are required' });
      }

      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
    }

    const payment = await Payment.findOneAndUpdate(
      {
        user: req.user._id,
        planId: plan.id,
        razorpayOrderId: razorpay_order_id,
        status: 'created'
      },
      {
        razorpayPaymentId: razorpay_payment_id || 'simulation_payment',
        razorpaySignature: razorpay_signature || 'simulation_signature',
        status: 'paid'
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment order not found or already verified' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      activePlan: plan.id,
      planStatus: 'active',
      paidAt: new Date()
    });

    const user = await User.findById(req.user._id).select('-passwordHash');

    res.json({
      message: 'Payment verified',
      payment,
      user
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
