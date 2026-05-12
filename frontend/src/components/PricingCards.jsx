import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, formatCurrency, getUser, isLoggedIn, setSession } from '../utils/api';

export const defaultPlans = [
  {
    id: 'mini_audit',
    name: 'Mini Audit',
    amount: 999,
    description: 'A focused AI API and usage review for a small product or workflow.'
  },
  {
    id: 'business_audit',
    name: 'Business Audit',
    amount: 4999,
    description: 'A full AI usage and infrastructure cost report for startups with active product traffic.'
  },
  {
    id: 'monthly_monitor',
    name: 'Monthly Monitor',
    amount: 9999,
    description: 'Ongoing monthly AI cost monitoring, report updates, and savings follow-up.'
  }
];

const planDetails = {
  mini_audit: {
    badge: 'Starter',
    accent: 'border-white/10 bg-white/[0.04]',
    features: ['One AI workflow reviewed', 'Model and token usage check', 'Savings estimate and action list']
  },
  business_audit: {
    badge: 'Most Popular',
    accent: 'border-yellow-300/40 bg-yellow-300/[0.08]',
    features: ['API and infrastructure audit', 'Before/after savings report', 'Engineering-ready action plan']
  },
  monthly_monitor: {
    badge: 'Growth',
    accent: 'border-sky-300/30 bg-sky-300/[0.06]',
    features: ['Monthly AI cost monitoring', 'Savings progress follow-up', 'Priority report workflow']
  }
};

const paymentsEnabled = import.meta.env.VITE_ENABLE_PAYMENTS === 'true';
let razorpayScriptPromise;

const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => {
      razorpayScriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

const withPlanDetails = (plan) => ({
  ...plan,
  ...(planDetails[plan.id] || {
    badge: 'Plan',
    accent: 'border-white/10 bg-white/[0.04]',
    features: ['AI cost report', 'Savings recommendations', 'Engineering-ready action plan']
  })
});

export default function PricingCards({ compact = false }) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(defaultPlans.map(withPlanDetails));
  const [loadingPlan, setLoadingPlan] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/payments/plans')
      .then((data) => {
        const loadedPlans = data.plans?.length ? data.plans : defaultPlans;
        setPlans(loadedPlans.map(withPlanDetails));
      })
      .catch(() => setPlans(defaultPlans.map(withPlanDetails)));
  }, []);

  const startCheckout = async (planId) => {
    if (!paymentsEnabled) {
      if (!isLoggedIn()) {
        navigate('/signup');
        return;
      }

      setLoadingPlan(planId);
      setError('');

      try {
        const data = await apiRequest('/auth/early-access/start', { method: 'POST' });
        setSession({ user: data.user });
        navigate('/dashboard');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingPlan('');
      }

      return;
    }

    if (!isLoggedIn()) {
      navigate('/signup');
      return;
    }

    setLoadingPlan(planId);
    setError('');

    try {
      const data = await apiRequest('/payments/razorpay/order', {
        method: 'POST',
        body: { planId }
      });

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Razorpay checkout failed to load. Please refresh and try again.');

      const user = getUser();
      const options = {
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'SpendGuard Audit',
        description: data.plan.name,
        order_id: data.order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        handler: async (response) => {
          try {
            const verified = await apiRequest('/payments/razorpay/verify', {
              method: 'POST',
              body: {
                planId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }
            });
            setSession({ user: verified.user });
            navigate('/dashboard');
          } catch (err) {
            setError(err.message);
            setLoadingPlan('');
          }
        },
        modal: {
          ondismiss: () => setLoadingPlan('')
        }
      };

      const checkout = new window.Razorpay(options);
      checkout.on('payment.failed', (response) => {
        setError(response?.error?.description || 'Payment failed. Please try again.');
        setLoadingPlan('');
      });
      checkout.open();
    } catch (err) {
      setError(err.message);
      setLoadingPlan('');
    }
  };

  return (
    <div>
      {error && (
        <p className="mx-auto mb-6 max-w-3xl rounded-lg border border-red-300/20 bg-red-300/10 p-4 text-sm font-bold text-red-100">
          {error}
        </p>
      )}

      <section className={`grid gap-5 ${compact ? 'md:grid-cols-3' : 'lg:grid-cols-3'}`}>
        {plans.map((plan) => (
          <article key={plan.id} className={`panel flex h-full flex-col transition hover:-translate-y-1 hover:border-white/20 ${plan.accent}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="label text-zinc-400">{plan.badge}</p>
              <span className="rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-300">
                {paymentsEnabled ? 'Razorpay' : 'Coming later'}
              </span>
            </div>
            <h3 className="mt-4 text-2xl font-black text-white">{plan.name}</h3>
            <p className="mt-3 text-4xl font-black text-yellow-200">{formatCurrency(plan.amount)}</p>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-400">{plan.description}</p>
            <ul className="mt-5 grid gap-3 text-sm font-bold text-zinc-300">
              {plan.features.map((feature) => (
                <li key={feature} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <button
                type="button"
                onClick={() => startCheckout(plan.id)}
                className="btn-primary w-full"
                disabled={loadingPlan === plan.id}
                aria-label={paymentsEnabled ? `Pay for ${plan.name}` : 'Start free early access'}
              >
                {loadingPlan === plan.id
                  ? paymentsEnabled ? 'Opening...' : 'Starting...'
                  : paymentsEnabled
                    ? isLoggedIn() ? 'Pay with Razorpay' : 'Create Account'
                    : isLoggedIn() ? 'Use Free Access' : 'Start Free Access'}
              </button>
              <p className="mt-3 text-center text-xs font-bold text-zinc-500">
                {paymentsEnabled
                  ? 'No card details are stored by SpendGuard Audit.'
                  : 'Payment is not required for early users.'}
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
