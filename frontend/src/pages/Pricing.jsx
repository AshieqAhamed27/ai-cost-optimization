import React from 'react';
import PricingCards from '../components/PricingCards';

const steps = [
  ['Create your account', 'Use a business email so reports and payment status stay attached to the right workspace.'],
  ['Pay securely', 'Razorpay creates the checkout order and the backend verifies the payment signature.'],
  ['Create reports', 'After payment, report creation unlocks in the dashboard for your active plan.']
];

export default function Pricing() {
  return (
    <main className="container-page py-10 md:py-16">
      <section className="mb-10 text-center">
        <p className="label text-yellow-300">Pricing</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black text-white md:text-6xl">
          Choose a paid audit plan and start delivering client reports.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-400">
          Payment is required before client report creation. Plans are designed for consultants, agencies, and companies that want a clear AI spend review.
        </p>
      </section>

      <PricingCards />

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {steps.map(([title, text]) => (
          <article key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-black text-white">{title}</h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
