import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PricingCards from '../components/PricingCards';
import TrialCallout from '../components/TrialCallout';
import { formatCurrency } from '../utils/api';

const metrics = [
  ['Who', 'AI startups'],
  ['Cost', 'API and infra'],
  ['Trial', '7 days'],
  ['Checkout', 'Razorpay']
];

const services = [
  {
    title: 'AI API usage audit',
    text: 'Review model calls, token volume, repeated prompts, embeddings, retries, and request patterns that increase provider bills.'
  },
  {
    title: 'Infrastructure cost review',
    text: 'Check vector databases, GPU or cloud inference, logs, queues, storage, and monitoring costs attached to AI features.'
  },
  {
    title: 'Optimization plan',
    text: 'Recommend model routing, caching, prompt trimming, batching, retention rules, and usage guardrails with estimated savings.'
  },
  {
    title: 'Monthly monitoring',
    text: 'Track spend per feature, customer, workspace, or workflow so cost does not grow silently as usage increases.'
  }
];

const workflow = [
  ['1. Share spend data', 'Add provider bills, usage exports, cost lines, traffic patterns, and infrastructure services.'],
  ['2. Identify waste', 'Find expensive model defaults, repeated work, over-retained vectors, noisy logs, and missing cost limits.'],
  ['3. Prioritize fixes', 'Separate quick wins from deeper engineering changes so the team knows what to fix first.'],
  ['4. Track savings', 'Use monthly reports to watch spend after model routing, caching, batching, and retention changes.']
];

const audiences = [
  'Seed and Series A startups shipping AI features',
  'Founders with rising OpenAI, Anthropic, or cloud bills',
  'Engineering teams without cost attribution',
  'AI agencies running client workloads',
  'SaaS teams adding assistants, agents, or copilots',
  'Finance teams asking why AI usage costs keep rising'
];

const payReasons = [
  {
    title: 'Reduce avoidable API spend',
    text: 'The audit looks for repeated calls, oversized prompts, wrong model choices, retry loops, and missing caching.'
  },
  {
    title: 'Get engineering-ready fixes',
    text: 'The report translates cost waste into concrete actions a founder or engineer can prioritize.'
  },
  {
    title: 'Protect gross margin',
    text: 'AI features can look successful while quietly losing money per customer. The audit helps surface that risk early.'
  }
];

const examples = [
  {
    title: 'Model routing',
    before: 'Every request uses a premium model, including summaries, labels, and simple classifications.',
    after: 'Route low-risk tasks to cheaper models and reserve premium calls for high-value steps.',
    impact: 'Common target: 20-45% lower model-call cost on routed tasks.'
  },
  {
    title: 'Context trimming',
    before: 'Large conversation history and unused metadata are sent with every prompt.',
    after: 'Trim context, summarize older state, and send only the fields needed for the task.',
    impact: 'Common target: 15-35% lower token volume on repeated workflows.'
  },
  {
    title: 'Vector and log retention',
    before: 'Embeddings, vector indexes, traces, and logs are retained without clear cleanup rules.',
    after: 'Add retention windows, sampling, archive rules, and index reviews.',
    impact: 'Common target: 10-30% lower storage and observability cost.'
  }
];

const technicalChecks = [
  'Model selection and fallback policy',
  'Prompt size and context window usage',
  'Caching, dedupe, and retry behavior',
  'Embedding batch and refresh strategy',
  'Vector database index and retention review',
  'GPU, serverless, and background job cost lines',
  'Per-customer or per-feature cost attribution',
  'Usage limits, alerts, and budget guardrails'
];

const trustSignals = [
  ['No secret keys requested', 'Start with invoices, usage exports, screenshots, and cost line items.'],
  ['Razorpay checkout', 'Payments are handled by Razorpay, and card details are not stored by SpendGuard Audit.'],
  ['Trial access', 'Teams can test the workflow for 7 days before choosing a paid plan.'],
  ['Transparent scope', 'Reports provide estimates and recommendations, not guaranteed savings.']
];

const initialCalculator = {
  modelApi: 75000,
  embeddings: 12000,
  vectorDb: 18000,
  cloudInference: 24000,
  logging: 9000
};

export default function Home() {
  const [calculator, setCalculator] = useState(initialCalculator);

  const estimate = useMemo(() => {
    const modelApi = Number(calculator.modelApi || 0);
    const embeddings = Number(calculator.embeddings || 0);
    const vectorDb = Number(calculator.vectorDb || 0);
    const cloudInference = Number(calculator.cloudInference || 0);
    const logging = Number(calculator.logging || 0);
    const total = modelApi + embeddings + vectorDb + cloudInference + logging;
    const possibleSavings = Math.min(
      total * 0.42,
      modelApi * 0.32 + embeddings * 0.24 + vectorDb * 0.22 + cloudInference * 0.18 + logging * 0.15
    );

    return {
      total,
      possibleSavings,
      afterOptimization: Math.max(0, total - possibleSavings),
      yearlySavings: possibleSavings * 12
    };
  }, [calculator]);

  const updateCalculator = (field, value) => {
    setCalculator((current) => ({ ...current, [field]: value }));
  };

  return (
    <main>
      <section className="container-page py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)] lg:items-center">
          <div>
            <p className="mb-5 inline-flex rounded-lg border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-sky-200">
              AI API and infrastructure cost audit
            </p>
            <h1 className="max-w-5xl text-5xl font-black leading-[0.98] text-white md:text-7xl">
              Help startups reduce unnecessary AI API and infrastructure costs.
            </h1>
            <p className="mt-6 max-w-3xl text-lg font-semibold leading-relaxed text-zinc-400">
              SpendGuard Audit reviews model usage, token volume, vector databases, cloud inference, observability, and workflow patterns to find avoidable spend before AI features hurt margin.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="btn-primary">Start 7-Day Free Trial</Link>
              <a href="#calculator" className="btn-secondary">Estimate Savings</a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map(([label, value]) => (
                <div key={label} className="border-l border-white/10 pl-4">
                  <p className="label">{label}</p>
                  <p className="mt-1 text-xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30">
            <img
              src="/report-preview.svg"
              alt="AI API and infrastructure cost audit report preview"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/15 py-8">
        <div className="container-page grid gap-4 md:grid-cols-3">
          {[
            ['For', 'Startups building AI features, agents, assistants, copilots, or API-heavy workflows.'],
            ['Reduces', 'Unnecessary model, token, embedding, vector DB, cloud, logging, and retry costs.'],
            ['Works by', 'Auditing usage data, finding waste patterns, and producing an engineering-ready savings plan.']
          ].map(([title, text]) => (
            <div key={title} className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-lg font-black text-white">{title}</h2>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="label text-yellow-300">AI Usage Audit Service</p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
            Not another AI tool. A cost-control workflow for teams already using AI.
          </h2>
          <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
            The service focuses on a real business problem: AI features can scale usage costs faster than revenue if nobody audits model choice, request volume, context size, and infrastructure around the product.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <article key={service.title} className="panel transition hover:-translate-y-1 hover:border-white/20">
              <h3 className="text-xl font-black text-white">{service.title}</h3>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{service.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="calculator" className="border-y border-white/10 bg-slate-900/45 py-12 md:py-16">
        <div className="container-page">
          <div className="mb-8 max-w-3xl">
            <p className="label text-emerald-200">Cost Calculator</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              Estimate where AI product costs may be leaking.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              Use this as a first-pass estimate. A real audit checks exports, request patterns, logs, model usage, and infrastructure line items before making recommendations.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.5fr)]">
            <section className="panel">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ['modelApi', 'LLM API spend'],
                  ['embeddings', 'Embedding spend'],
                  ['vectorDb', 'Vector DB and storage'],
                  ['cloudInference', 'GPU or cloud inference'],
                  ['logging', 'Logs, tracing, observability']
                ].map(([field, label]) => (
                  <label key={field} className="grid gap-2">
                    <span className="label">{label}</span>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={calculator[field]}
                      onChange={(event) => updateCalculator(field, event.target.value)}
                    />
                  </label>
                ))}
              </div>
            </section>

            <aside className="panel border-emerald-300/20 bg-emerald-300/[0.07]">
              <p className="label text-emerald-200">Estimated Result</p>
              <div className="mt-5 grid gap-3">
                {[
                  ['Current monthly cost', estimate.total],
                  ['Possible monthly savings', estimate.possibleSavings],
                  ['Cost after fixes', estimate.afterOptimization],
                  ['Possible yearly savings', estimate.yearlySavings]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-black/20 p-4">
                    <p className="label">{label}</p>
                    <p className="mt-2 text-2xl font-black text-white">{formatCurrency(value)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs font-bold leading-relaxed text-zinc-500">
                Estimate only. Final savings depend on architecture, traffic, contracts, and engineering changes.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="label text-sky-200">Before And After</p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
            Concrete audit examples make the value easier to believe.
          </h2>
          <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
            These are example savings levers the audit checks. Final results depend on traffic, architecture, contracts, and engineering changes.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {examples.map((item) => (
            <article key={item.title} className="panel">
              <h3 className="text-xl font-black text-white">{item.title}</h3>
              <div className="mt-4 grid gap-3">
                <div className="rounded-lg border border-red-300/20 bg-red-300/[0.06] p-3">
                  <p className="label text-red-100">Before</p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{item.before}</p>
                </div>
                <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] p-3">
                  <p className="label text-emerald-200">After</p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{item.after}</p>
                </div>
              </div>
              <p className="mt-4 text-sm font-black text-yellow-200">{item.impact}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/15 py-12 md:py-16">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="label text-emerald-200">Why Startups Pay</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              The audit protects product margin, not just the monthly bill.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              Buyers care about whether each user, feature, or workflow costs more than it should. The report turns unclear usage into decisions the team can act on.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {payReasons.map((reason) => (
              <article key={reason.title} className="panel">
                <h3 className="text-xl font-black text-white">{reason.title}</h3>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{reason.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1fr)]">
          <div>
            <p className="label text-sky-200">Technical Audit Checklist</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              Show the engineering depth before asking for payment.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              This is the credibility layer: the service names the specific systems and usage patterns it reviews.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {technicalChecks.map((item) => (
              <article key={item} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-bold text-zinc-300">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="plans" className="border-y border-white/10 bg-slate-900/45 py-12 md:py-16">
        <div className="container-page">
          <TrialCallout />

          <div className="mb-8 mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(280px,0.4fr)] lg:items-end">
            <div>
              <p className="label text-emerald-200">Plans And Checkout</p>
              <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
                Start free, then buy the audit plan that matches your usage.
              </h2>
              <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
                Trial users can create reports for 7 days. After that, secure Razorpay checkout keeps the audit workflow active.
              </p>
            </div>
            <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
              <p className="label text-emerald-200">Revenue Control</p>
              <p className="mt-3 text-2xl font-black text-white">Trial converts to paid</p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-500">
                The trial proves value first, then report creation requires payment after 7 days.
              </p>
            </div>
          </div>

          <PricingCards compact />
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1fr)]">
          <div>
            <p className="label text-sky-200">Delivery Workflow</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              From usage export to engineering-ready savings report.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              SpendGuard Audit supports the full operating model: sell the audit, collect payment, capture cost data, and deliver recommendations.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {workflow.map(([title, text]) => (
              <article key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-lg font-black text-white">{title}</h3>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page pb-14 md:pb-20">
        <div className="grid gap-8 rounded-lg border border-yellow-300/20 bg-yellow-300/[0.06] p-6 md:p-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
          <div>
            <p className="label text-yellow-200">Who Can Use It</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
              Best for startups where AI usage cost is becoming a real operating problem.
            </h2>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="btn-primary">Start Free Trial</Link>
              <Link to="/pricing" className="btn-secondary">Compare Plans</Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {audiences.map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-sm font-bold text-zinc-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
