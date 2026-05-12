import React from 'react';
import PricingCards from '../components/PricingCards';
import TrialCallout from '../components/TrialCallout';

const steps = [
  ['Start free trial', 'Use a business email and create audit reports for 7 days with no card required.'],
  ['Prove the value', 'Review real AI API and infrastructure spend and see whether the report can identify avoidable monthly costs.'],
  ['Upgrade securely', 'After the trial, Razorpay checkout activates a paid plan and keeps report creation unlocked.']
];

export default function Pricing() {
  return (
    <main className="container-page py-10 md:py-16">
      <section className="mb-10 text-center">
        <p className="label text-yellow-300">Pricing</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black text-white md:text-6xl">
          Start with a 7-day trial, then audit real AI usage costs.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-400">
          Try the audit workflow before paying. When the trial ends, a paid plan keeps AI usage reports and cost reviews active.
        </p>
      </section>

      <section className="mb-8">
        <TrialCallout />
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
