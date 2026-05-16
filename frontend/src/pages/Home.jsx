import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PricingCards from '../components/PricingCards';
import TrialCallout from '../components/TrialCallout';
import { formatCurrency } from '../utils/api';

const metrics = [
  ['Governance', 'AI spend control'],
  ['Scope', 'Multi-team usage'],
  ['Buyer', 'CFO + CTO'],
  ['Output', 'Board-ready plan']
];

const positioningCards = [
  {
    title: 'What it becomes',
    text: 'SpendGuard is an AI cost governance platform for companies running LLM APIs, vector databases, cloud inference, logs, and agent workflows across teams.'
  },
  {
    title: 'Who it serves',
    text: 'CFOs, CTOs, founders, AI platform teams, agencies, and business units whose AI spend is growing across products, regions, and customers.'
  },
  {
    title: 'What leaders get',
    text: 'A governance report with spend attribution, savings estimates, budget warnings, unit economics, owners, and a 30-day operating plan.'
  },
  {
    title: 'How it starts',
    text: 'Teams can begin with invoices, usage exports, screenshots, CSV rows, or manual cost lines. No passwords, API keys, or private customer data needed.'
  }
];

const services = [
  {
    title: 'Global AI spend review',
    text: 'Review model calls, token volume, repeated prompts, embeddings, retries, and request patterns across products, teams, and regions.'
  },
  {
    title: 'FinOps attribution',
    text: 'Map vector databases, GPU or cloud inference, logs, queues, storage, and monitoring costs to workflows, owners, customers, and budgets.'
  },
  {
    title: 'Optimization command center',
    text: 'Recommend model routing, caching, prompt trimming, batching, retention rules, and usage guardrails with estimated savings and owners.'
  },
  {
    title: 'Executive reporting',
    text: 'Track spend per product, customer, workspace, department, or workflow so leadership can control cost before it becomes margin risk.'
  }
];

const realWorldProblems = [
  {
    title: 'AI spend spreads across departments',
    pain: 'Support, sales, product, engineering, and customer success may all adopt AI tools before finance can see one clean operating picture.',
    outcome: 'SpendGuard consolidates cost lines by owner, workflow, customer, and budget so leaders can decide what to scale, cap, or redesign.'
  },
  {
    title: 'Provider invoices do not explain margin',
    pain: 'Invoices show totals, but they rarely explain which product line, region, customer tier, prompt path, retry loop, or vector index is causing margin pressure.',
    outcome: 'The governance report turns provider spend into product-level and customer-level economics that finance and engineering can act on together.'
  },
  {
    title: 'AI waste becomes a management problem',
    pain: 'Oversized prompts, premium default models, repeated calls, unused indexes, excessive logs, and missing limits can become normal operating waste.',
    outcome: 'SpendGuard ranks the leaks, estimates savings, assigns owners, and gives teams a 30-day action plan that can be reviewed every month.'
  },
  {
    title: 'Savings need proof for leadership',
    pain: 'Large organizations need evidence that cost fixes worked, that savings did not reverse, and that policies are followed after launch.',
    outcome: 'Before and after tracking records actions, confirmed savings, implementation notes, and spend after cleanup for recurring governance reviews.'
  }
];

const workflow = [
  ['1. Consolidate spend evidence', 'Add provider bills, usage exports, cost lines, traffic patterns, departments, customers, and infrastructure services.'],
  ['2. Attribute usage to owners', 'Map AI spend to workflows, products, regions, customers, and cost centers so accountability is visible.'],
  ['3. Approve governance controls', 'Separate quick wins from deeper engineering changes, then assign budgets, limits, routing rules, and retention policies.'],
  ['4. Report savings monthly', 'Track spend after model routing, caching, batching, retention, and procurement changes so savings remain visible.']
];

const audiences = [
  'AI-first SaaS companies expanding across regions',
  'CFOs and finance teams managing AI vendor spend',
  'CTOs and AI platform teams setting usage policies',
  'Enterprise product teams shipping copilots and agents',
  'AI agencies managing client workload profitability',
  'Procurement teams preparing vendor negotiation evidence'
];

const payReasons = [
  {
    title: 'Turn AI spend into governance',
    text: 'The platform connects repeated calls, oversized prompts, wrong model choices, retry loops, and missing caching to ownership and budgets.'
  },
  {
    title: 'Align finance and engineering',
    text: 'Reports translate cost waste into concrete actions that CFOs, CTOs, product owners, and engineers can review in one operating language.'
  },
  {
    title: 'Protect margin at scale',
    text: 'AI features can look successful while quietly losing money per customer, product, region, or workflow. SpendGuard surfaces that risk early.'
  }
];

const paidDeliverables = [
  ['Executive cost command', 'Ranked waste findings across model calls, tokens, embeddings, vector storage, logs, cloud inference, teams, and workflow spend.'],
  ['ROI and margin model', 'Monthly savings estimate, yearly opportunity, spend after cleanup, cost per active user, cost per request, and budget risk.'],
  ['Governance playbook', 'Concrete fixes for model routing, caching, context trimming, retention, attribution, approval rules, and budget guardrails.'],
  ['Savings assurance', 'Progress tracking, confirmed savings, implementation notes, PDF export, and private report sharing for leadership reviews.']
];

const differentiators = [
  {
    stage: 'Operating model',
    title: 'AI spend control tower',
    improve: 'Connect AI spend to customers, workflows, products, regions, owners, and budgets so teams can see where margin is at risk.',
    unique: 'Most cost tools show provider totals. SpendGuard explains product-level AI economics.'
  },
  {
    stage: 'Policy layer',
    title: 'Governance finding report',
    improve: 'Group expensive defaults, repeated calls, long prompts, missing caching, unused storage, weak limits, and missing approvals.',
    unique: 'Turns vague AI bills into specific policies a finance and engineering team can enforce.'
  },
  {
    stage: 'Assurance',
    title: 'Savings proof ledger',
    improve: 'Track recommended changes, implementation status, confirmed monthly savings, executive notes, and before/after spend.',
    unique: 'Keeps the review useful after the first report instead of becoming a forgotten PDF.'
  },
  {
    stage: 'Procurement ready',
    title: 'Budget policy autopilot',
    improve: 'Set budget thresholds, usage warnings, escalation paths, and cost ownership so spend does not grow silently.',
    unique: 'Combines finance guardrails with AI engineering decisions in one workflow.'
  }
];

const uniquenessMoves = [
  ['From audit to control plane', 'Start with cost evidence, then build monthly governance around AI usage, ownership, and savings proof.'],
  ['From founder tool to leadership system', 'Speak to finance, engineering, product, procurement, and client delivery teams in the same report.'],
  ['From one report to global operating rhythm', 'Create repeatable reviews that track budgets, owners, policies, and confirmed savings.']
];

const savingsLevers = [
  {
    title: 'Model routing',
    before: 'Every request uses a premium model, including summaries, labels, and simple classifications.',
    after: 'Route low-risk tasks to cheaper models and reserve premium calls for high-value steps.',
    impact: 'Governance focus: reduce avoidable premium-model usage without reducing output quality.'
  },
  {
    title: 'Context trimming',
    before: 'Large conversation history and unused metadata are sent with every prompt.',
    after: 'Trim context, summarize older state, and send only the fields needed for the task.',
    impact: 'Governance focus: lower token volume on repeated workflows while preserving task context.'
  },
  {
    title: 'Vector and log retention',
    before: 'Embeddings, vector indexes, traces, and logs are retained without clear cleanup rules.',
    after: 'Add retention windows, sampling, archive rules, and index reviews.',
    impact: 'Governance focus: stop silent storage and observability growth before it becomes margin drag.'
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
  'Department, region, and cost-center ownership',
  'Usage limits, alerts, and budget guardrails',
  'Procurement evidence for vendor negotiations'
];

const trustSignals = [
  ['No secret-key ingestion', 'Start with invoices, usage exports, screenshots, and cost line items before connecting deeper systems.'],
  ['Enterprise payment path', 'When payments are enabled, Razorpay handles checkout and card details are not stored by SpendGuard.'],
  ['Pilot to scale', 'Early users can use the workflow free while enterprise plans and procurement paths stay ready for later.'],
  ['Transparent scope', 'Reports provide estimates, controls, and recommendations, not guaranteed savings.']
];

const initialCalculator = {
  modelApi: '',
  embeddings: '',
  vectorDb: '',
  cloudInference: '',
  logging: ''
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
              AI cost governance for global teams
            </p>
            <h1 className="max-w-5xl text-5xl font-black leading-[0.98] text-white md:text-7xl">
              Run AI spend like a multinational company.
            </h1>
            <p className="mt-6 max-w-3xl text-lg font-semibold leading-relaxed text-zinc-400">
              SpendGuard turns scattered AI API, token, vector database, cloud inference, and logging costs into a global governance report with savings estimates, owners, policies, and a 30-day control plan.
            </p>
            <p className="mt-4 max-w-3xl text-sm font-bold leading-relaxed text-emerald-200">
              Built for CFO, CTO, product, engineering, procurement, and delivery teams. No secret keys required to start.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
              <Link to="/signup" className="btn-primary">Start Global Review</Link>
              <a href="#calculator" className="btn-secondary">Model Savings</a>
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
              alt="AI spend governance command center preview"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/15 py-8">
        <div className="container-page grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {positioningCards.map(({ title, text }) => (
            <div key={title} className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-lg font-black text-white">{title}</h2>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="label text-red-100">Real Problem Solved</p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
            Multinational AI spend fails when every team buys and scales in a different language.
          </h2>
          <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
            SpendGuard helps leadership answer four practical questions: where is AI spend leaking, who owns it, what policy should change, and did the fix actually improve margin?
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {realWorldProblems.map((problem) => (
            <article key={problem.title} className="panel">
              <h3 className="text-2xl font-black text-white">{problem.title}</h3>
              <div className="mt-5 grid gap-3">
                <div className="rounded-lg border border-red-300/20 bg-red-300/[0.06] p-4">
                  <p className="label text-red-100">Pain in the real world</p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{problem.pain}</p>
                </div>
                <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] p-4">
                  <p className="label text-emerald-200">What the product does</p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-300">{problem.outcome}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-900/45 py-12 md:py-16">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
            <div>
              <p className="label text-yellow-200">Why Users Pay</p>
              <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
                Enterprise buyers do not pay for a report. They pay for operating decisions that reduce waste.
              </h2>
              <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
                SpendGuard packages the hard part: turning messy bills and usage lines into owners, controls, savings estimates, procurement evidence, and proof after implementation.
              </p>
              <Link to="/pricing" className="btn-secondary mt-6">See Governance Plans</Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {paidDeliverables.map(([title, text]) => (
                <article key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                  <h3 className="text-lg font-black text-white">{title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="label text-yellow-300">AI Governance Platform</p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
            One product, one job: make AI spend controllable across the company.
          </h2>
          <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
            The platform focuses on the systems that make AI products expensive at scale: model choice, request volume, context size, retries, embeddings, storage, cloud inference, logs, cost centers, and missing spend limits.
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

      <section className="border-y border-white/10 bg-black/15 py-12 md:py-16">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="label text-emerald-200">Why It Is Different</p>
              <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
                SpendGuard is positioned around AI cost governance, not generic finance tracking.
              </h2>
              <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
                Serious buyers should understand the product quickly: it is for organizations with real AI usage, real bills, and a need to govern savings they can act on.
              </p>
            </div>

            <div className="grid gap-3">
              {uniquenessMoves.map(([title, text]) => (
                <article key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <h3 className="text-lg font-black text-white">{title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-500">{text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {differentiators.map((feature) => (
              <article key={feature.title} className="panel transition hover:-translate-y-1 hover:border-emerald-300/30">
                <p className="label text-emerald-200">{feature.stage}</p>
                <h3 className="mt-3 text-2xl font-black text-white">{feature.title}</h3>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="label">What it clarifies</p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{feature.improve}</p>
                </div>
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="label text-yellow-200">Uniqueness angle</p>
                  <p className="mt-2 text-sm font-black leading-relaxed text-white">{feature.unique}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="calculator" className="border-y border-white/10 bg-slate-900/45 py-12 md:py-16">
        <div className="container-page">
          <div className="mb-8 max-w-3xl">
            <p className="label text-emerald-200">Cost Calculator</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              Estimate where company-wide AI costs may be leaking.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              Enter monthly spend for a first-pass estimate. A real governance review checks exports, request patterns, logs, model usage, ownership, budgets, and infrastructure line items before making recommendations.
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
            Concrete governance levers make the value easier to defend.
          </h2>
          <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
            These are the waste patterns the platform checks. Final results depend on traffic, architecture, contracts, ownership, and engineering changes.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {savingsLevers.map((item) => (
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
            <p className="label text-emerald-200">Why Teams Value It</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              Governance protects company margin, not just the monthly bill.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              Buyers care whether each user, feature, region, customer, or workflow costs more than it should. SpendGuard turns unclear usage into decisions the company can act on.
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
            <p className="label text-sky-200">Technical Governance Checklist</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              Show the engineering depth before asking for enterprise trust.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              This is the credibility layer: the platform names the specific systems, owners, and usage patterns it reviews.
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

      <section className="border-y border-white/10 bg-black/15 py-12 md:py-16">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1fr)]">
            <div>
            <p className="label text-emerald-200">Trust Model</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
                Start with spend evidence, not secret access.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
                SpendGuard is designed for serious teams that need useful cost answers without handing over passwords, secret API keys, or private customer data.
              </p>
              <Link to="/security" className="btn-secondary mt-6">View Security</Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {trustSignals.map(([title, text]) => (
                <article key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                  <h3 className="text-lg font-black text-white">{title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="plans" className="border-y border-white/10 bg-slate-900/45 py-12 md:py-16">
        <div className="container-page">
          <TrialCallout />

          <div className="mb-8 mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(280px,0.4fr)] lg:items-end">
            <div>
              <p className="label text-emerald-200">Early Access And Future Plans</p>
              <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
                Pilot now, scale into enterprise governance later.
              </h2>
              <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
                Early users can create reports free right now. Razorpay checkout and higher-value plans remain built in for when procurement and paid pilots are enabled.
              </p>
            </div>
            <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
              <p className="label text-emerald-200">Launch Mode</p>
              <p className="mt-3 text-2xl font-black text-white">Free enterprise pilot</p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-500">
                Payment can be turned on later without removing the existing checkout and plan flow.
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
              From usage export to executive-ready governance report.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              SpendGuard supports the operating model: capture cost data, assign ownership, deliver recommendations, prove savings, and enable payment when the business is ready.
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
              Best for teams preparing AI operations for enterprise scale.
            </h2>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="btn-primary">Start Global Review</Link>
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
