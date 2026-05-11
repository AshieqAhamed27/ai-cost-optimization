import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, formatCurrency, getUser, isLoggedIn, setSession } from '../utils/api';

const fallbackPlans = [
  { id: 'mini_audit', name: 'Mini Audit', amount: 999, description: 'One focused review for a small workspace.' },
  { id: 'business_audit', name: 'Business Audit', amount: 4999, description: 'A full cost report for teams with multiple AI tools.' },
  { id: 'monthly_monitor', name: 'Monthly Monitor', amount: 9999, description: 'Ongoing spend tracking and savings follow-up.' }
];

const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

export default function Pricing() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(fallbackPlans);
  const [loadingPlan, setLoadingPlan] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/payments/plans')
      .then((data) => setPlans(data.plans || fallbackPlans))
      .catch(() => setPlans(fallbackPlans));
  }, []);

  const startCheckout = async (planId) => {
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

      if (data.simulation) {
        const verified = await apiRequest('/payments/razorpay/verify', {
          method: 'POST',
          body: {
            planId,
            razorpay_order_id: data.order.id
          }
        });
        setSession({ user: verified.user });
        navigate('/dashboard');
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Razorpay checkout failed to load');

      const user = getUser();
      const options = {
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'AI Cost Audit',
        description: data.plan.name,
        order_id: data.order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        handler: async (response) => {
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
        },
        modal: {
          ondismiss: () => setLoadingPlan('')
        }
      };

      const checkout = new window.Razorpay(options);
      checkout.open();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPlan('');
    }
  };

  return (
    <main className="container-page py-10 md:py-16">
      <section className="mb-10 text-center">
        <p className="label text-yellow-300">Pricing</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black text-white md:text-6xl">
          Get paid before creating client reports.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-500">
          A paid plan unlocks report creation. Secure checkout is handled through Razorpay.
        </p>
      </section>

      {error && <p className="mx-auto mb-6 max-w-2xl rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm font-bold text-red-100">{error}</p>}

      <section className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.id} className={`panel transition hover:-translate-y-1 ${plan.id === 'business_audit' ? 'border-yellow-300/30 bg-yellow-300/[0.07]' : ''}`}>
            <p className="label text-zinc-500">{plan.id === 'business_audit' ? 'Most useful' : 'Package'}</p>
            <h2 className="mt-3 text-2xl font-black text-white">{plan.name}</h2>
            <p className="mt-3 text-4xl font-black text-yellow-200">{formatCurrency(plan.amount)}</p>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{plan.description}</p>
            <ul className="mt-5 grid gap-3 text-sm font-bold text-zinc-300">
              <li className="rounded-2xl border border-white/10 bg-black/20 p-3">AI spend report</li>
              <li className="rounded-2xl border border-white/10 bg-black/20 p-3">Savings recommendations</li>
              <li className="rounded-2xl border border-white/10 bg-black/20 p-3">Client-ready action plan</li>
            </ul>
            <button type="button" onClick={() => startCheckout(plan.id)} className="btn-primary mt-6 w-full" disabled={loadingPlan === plan.id}>
              {loadingPlan === plan.id ? 'Opening...' : isLoggedIn() ? 'Pay with Razorpay' : 'Create Account to Pay'}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
