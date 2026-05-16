import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, formatCurrency, getUser, isLoggedIn, setSession } from '../utils/api';

export const defaultPlans = [
  {
    id: 'mini_audit',
    name: 'Team Pilot',
    amount: 2499,
    description: 'A focused governance pilot for one AI workflow, team, or product area that needs a fast savings decision.'
  },
  {
    id: 'business_audit',
    name: 'Business Command',
    amount: 14999,
    description: 'A full AI usage and infrastructure governance report for a company with active product traffic and multiple owners.'
  },
  {
    id: 'monthly_monitor',
    name: 'Global Governance',
    amount: 49999,
    description: 'Ongoing AI spend control for companies that need recurring accountability, executive reporting, and policy follow-up.'
  }
];

const planDetails = {
  mini_audit: {
    badge: 'Pilot',
    accent: 'border-white/10 bg-white/[0.04]',
    valueNote: 'Best when one assistant, agent, or API-heavy workflow is already creating billing doubt.',
    features: ['One AI workflow governance map', 'Break-even savings estimate', '3 priority fixes with owners']
  },
  business_audit: {
    badge: 'Most Strategic',
    accent: 'border-yellow-300/40 bg-yellow-300/[0.08]',
    valueNote: 'Best when AI spend affects product margin and leaders need a report finance and engineering can act on.',
    features: ['API and infrastructure waste findings', 'Unit economics and budget risk', '30-day governance plan plus PDF report']
  },
  monthly_monitor: {
    badge: 'Enterprise',
    accent: 'border-sky-300/30 bg-sky-300/[0.06]',
    valueNote: 'Best when usage changes every month and the company needs to prove savings did not disappear.',
    features: ['Monthly executive savings review', 'Confirmed savings proof ledger', 'Budget guardrails and procurement evidence']
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
    valueNote: 'Useful when AI usage cost is high enough that a clear savings plan can pay for the report.',
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
        name: 'SpendGuard',
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
            <div className="mt-4 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] p-4">
              <p className="label text-emerald-200">Worth it if</p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-300">{plan.valueNote}</p>
              <p className="mt-3 text-xs font-black uppercase tracking-widest text-yellow-200">
                Break-even: find {formatCurrency(plan.amount)} avoidable monthly waste.
              </p>
            </div>
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
                aria-label={paymentsEnabled ? `Pay for ${plan.name}` : 'Start free pilot'}
              >
                {loadingPlan === plan.id
                  ? paymentsEnabled ? 'Opening...' : 'Starting...'
                  : paymentsEnabled
                    ? isLoggedIn() ? 'Pay with Razorpay' : 'Create Account'
                    : isLoggedIn() ? 'Use Free Pilot' : 'Start Free Pilot'}
              </button>
              <p className="mt-3 text-center text-xs font-bold text-zinc-500">
                {paymentsEnabled
                  ? 'No card details are stored by SpendGuard.'
                  : 'Payment is not required for pilot users.'}
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
