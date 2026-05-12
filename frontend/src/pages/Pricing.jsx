import React from 'react';
import PricingCards from '../components/PricingCards';
import TrialCallout from '../components/TrialCallout';

const steps = [
  ['Start free early access', 'Use a business email and create audit reports with no card required.'],
  ['Use real spend data', 'Review real AI API and infrastructure spend and see whether the report can identify avoidable monthly costs.'],
  ['Payment ready for later', 'Razorpay checkout stays in the product for future paid plans, but early users are free now.']
];

export default function Pricing() {
  return (
    <main className="container-page py-10 md:py-16">
      <section className="mb-10 text-center">
        <p className="label text-yellow-300">Pricing</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black text-white md:text-6xl">
          Free for early users now. Paid plans are ready for later.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-400">
          Use the audit workflow with real AI spend data. Payment remains built in, but early access does not require checkout.
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
