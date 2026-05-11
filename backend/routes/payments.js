const crypto = require('crypto');
const express = require('express');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { plans, getPlan } = require('../utils/plans');

const router = express.Router();

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

    const simulation = process.env.PAYMENT_SIMULATION === 'true';
    const razorpay = getRazorpay();

    if (simulation || !razorpay) {
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

    const order = await razorpay.orders.create({
      amount: plan.amount * 100,
      currency: 'INR',
      receipt: `audit_${req.user._id}_${Date.now()}`,
      notes: {
        userId: String(req.user._id),
        planId: plan.id
      }
    });

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
      razorpay_signature,
      simulation
    } = req.body;

    const plan = getPlan(planId);
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const allowSimulation = process.env.PAYMENT_SIMULATION === 'true' || simulation === true;

    if (!allowSimulation) {
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
        razorpayOrderId: razorpay_order_id
      },
      {
        razorpayPaymentId: razorpay_payment_id || 'simulation_payment',
        razorpaySignature: razorpay_signature || 'simulation_signature',
        status: 'paid'
      },
      { new: true }
    );

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
