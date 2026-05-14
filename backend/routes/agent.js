const express = require('express');
const mongoose = require('mongoose');
const { requireAuth, requireActivePlan } = require('../middleware/auth');
const Audit = require('../models/Audit');
const { calculateAudit } = require('../utils/costEngine');

const router = express.Router();

const cleanText = (value, maxLength = 800) =>
  String(value || '').trim().slice(0, maxLength);

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeCostLines = (tools = []) =>
  tools
    .filter((tool) => cleanText(tool?.name, 120))
    .slice(0, 12)
    .map((tool) => ({
      name: cleanText(tool.name, 120),
      provider: cleanText(tool.provider, 80),
      modelName: cleanText(tool.modelName, 120),
      workflow: cleanText(tool.workflow, 120),
      customer: cleanText(tool.customer, 120),
      category: cleanText(tool.category || 'Model API', 80),
      monthlyCost: Math.max(0, toNumber(tool.monthlyCost)),
      seats: Math.max(1, Math.round(toNumber(tool.seats) || 1)),
      usage: ['high', 'medium', 'low', 'unused'].includes(tool.usage) ? tool.usage : 'medium',
      monthlyRequests: Math.max(0, Math.round(toNumber(tool.monthlyRequests))),
      avgTokens: Math.max(0, Math.round(toNumber(tool.avgTokens))),
      modelTier: ['premium', 'balanced', 'economy', 'mixed', 'unknown'].includes(tool.modelTier) ? tool.modelTier : 'unknown',
      caching: ['none', 'partial', 'good', 'unknown'].includes(tool.caching) ? tool.caching : 'unknown',
      owner: cleanText(tool.owner, 80),
      budgetLimit: Math.max(0, toNumber(tool.budgetLimit))
    }));

const normalizeControl = (value) =>
  ['yes', 'partial', 'no', 'unknown'].includes(value) ? value : 'unknown';

const money = (value) =>
  `Rs ${Math.round(Number(value || 0)).toLocaleString('en-IN')}`;

const topCostLines = (costLines) =>
  [...costLines].sort((a, b) => b.monthlyCost - a.monthlyCost).slice(0, 3);

const buildRuleAgent = ({ companyName, businessType, teamSize, notes, costLines, audit }) => {
  const topLines = topCostLines(costLines);
  const lowUsageLines = costLines.filter((line) => ['low', 'unused'].includes(line.usage));
  const modelLines = costLines.filter((line) => /model|api|openai|anthropic|llm/i.test(`${line.category} ${line.name}`));
  const infraLines = costLines.filter((line) => /vector|cloud|gpu|storage|logging|observability|worker|job/i.test(`${line.category} ${line.name}`));

  const quickWins = [];

  if (modelLines.length) {
    quickWins.push({
      title: 'Route simple tasks to cheaper models',
      detail: 'Separate classification, extraction, summaries, and high-value reasoning calls so premium models are not used for every request.',
      impact: 'High'
    });
  }

  if (lowUsageLines.length) {
    quickWins.push({
      title: 'Cap or pause low-usage cost lines',
      detail: `${lowUsageLines.map((line) => line.name).slice(0, 3).join(', ')} are marked low or unused. Add usage caps before the next billing cycle.`,
      impact: 'High'
    });
  }

  if (infraLines.length) {
    quickWins.push({
      title: 'Review retention for vectors, logs, and traces',
      detail: 'Add cleanup windows, sampling, and archive rules for infrastructure cost lines that grow with traffic.',
      impact: 'Medium'
    });
  }

  if (topLines.length) {
    quickWins.push({
      title: 'Start with the largest cost line',
      detail: `${topLines[0].name} is the biggest monthly cost. Audit prompt size, retries, caching, and per-customer usage first.`,
      impact: 'High'
    });
  }

  (audit.wasteFindings || []).slice(0, 2).forEach((finding) => {
    if (!quickWins.some((item) => item.title === finding.title)) {
      quickWins.push({
        title: finding.title,
        detail: `${finding.detail} Estimated monthly opportunity: ${money(finding.estimatedSavings)}.`,
        impact: finding.impact || 'Medium'
      });
    }
  });

  const risks = [
    'No per-customer or per-feature cost attribution makes it hard to know whether AI features are profitable.',
    'Retries, long prompts, and retained context can raise model bills without obvious product value.',
    'Vector storage, traces, and logs can grow quietly when retention rules are not reviewed.'
  ];

  const questions = [
    'Which features or customers create the most model calls each month?',
    'What percentage of requests can safely use a cheaper model or cached answer?',
    'How much context is sent on repeated calls, and can older state be summarized?',
    'What retention period is required for vectors, logs, traces, and generated artifacts?'
  ];

  const nextSteps = [
    'Export model usage, token volume, and billing data for the last 30 days.',
    'Tag the top workflows by feature, customer, or workspace.',
    'Test model routing and context trimming on one high-cost workflow.',
    'Set a monthly budget alert for each major provider or infrastructure service.'
  ];

  return {
    summary: `${cleanText(companyName || businessType || 'This account', 80)} has ${money(audit.monthlySpend)} in monthly AI and infrastructure cost lines, ${audit.riskLevel || 'Medium'} risk, and an estimated ${money(audit.possibleMonthlySavings)} monthly optimization opportunity.`,
    confidence: costLines.length >= 3 ? 'medium' : 'low',
    quickWins: quickWins.slice(0, 4),
    risks,
    questions,
    nextSteps,
    disclaimer: 'This is an audit assistant estimate. Confirm savings with real usage exports, logs, architecture review, and billing data before promising results.'
  };
};

const buildRuleReportPack = (audit) => {
  const costLines = normalizeCostLines(audit.tools || []);
  const topLines = topCostLines(costLines);
  const lowUsageLines = costLines.filter((line) => ['low', 'unused'].includes(line.usage));
  const topLineNames = topLines.map((line) => line.name).join(', ') || 'the largest AI cost lines';
  const lowUsageNames = lowUsageLines.map((line) => line.name).slice(0, 3).join(', ');
  const findings = (audit.wasteFindings || []).slice(0, 4);

  const executiveSummary = [
    `${audit.companyName} is currently tracking ${money(audit.monthlySpend)} in monthly AI and infrastructure spend.`,
    `The audit model estimates up to ${money(audit.possibleMonthlySavings)} in possible monthly savings before deeper usage-log validation and rates the risk level as ${audit.riskLevel || 'Medium'}.`,
    `The first priority should be reviewing ${topLineNames}, then adding ownership, budgets, and usage controls around recurring model and infrastructure spend.`
  ].join(' ');

  const actionPlan = (audit.actionPlan || []).length
    ? audit.actionPlan.map((item) => ({
      week: item.phase || 'Next',
      title: item.title,
      detail: item.detail
    })).slice(0, 4)
    : [
      {
        week: 'Week 1',
        title: 'Create a clean usage baseline',
        detail: 'Export the last 30 days of provider billing, token usage, model calls, vector database usage, logs, and background job costs. Tag each line by feature, customer, and owner.'
      },
      {
        week: 'Week 2',
        title: 'Reduce waste in the highest-cost workflows',
        detail: `Review ${topLineNames} for long prompts, duplicate calls, retry loops, expensive default models, and unused seats or environments.`
      },
      {
        week: 'Week 3',
        title: 'Add control systems',
        detail: 'Set monthly budget alerts, per-workspace usage limits, prompt size checks, cache rules, and retention windows for vectors, traces, generated files, and logs.'
      },
      {
        week: 'Week 4',
        title: 'Validate savings and make it repeatable',
        detail: 'Compare the new spend baseline against the original audit, document the changes, and schedule a monthly review for high-growth cost lines.'
      }
    ];

  const checklist = [
    'Add per-feature and per-customer AI cost tags before scaling usage.',
    'Route simple classification, extraction, and formatting tasks to cheaper models.',
    'Cache repeated answers and summaries where freshness is not required.',
    'Trim long context windows and summarize old state before repeated agent calls.',
    'Set retention rules for vectors, logs, traces, generated files, and test data.',
    'Create monthly budget alerts for every major AI and infrastructure provider.'
  ];

  if (lowUsageNames) {
    checklist.unshift(`Review or pause low-usage cost lines: ${lowUsageNames}.`);
  }

  findings.forEach((finding) => {
    checklist.unshift(`${finding.category || 'Cost'}: ${finding.title} (${money(finding.estimatedSavings)} estimated monthly opportunity).`);
  });

  const clientEmail = [
    `Subject: AI cost audit action plan for ${audit.companyName}`,
    '',
    `Hi ${audit.companyName} team,`,
    '',
    `I reviewed your current AI and infrastructure spend and found ${money(audit.monthlySpend)} in monthly cost lines with a possible optimization range of up to ${money(audit.possibleMonthlySavings)} per month after validation.`,
    '',
    `The first place to focus is ${topLineNames}. I recommend starting with usage tagging, prompt/context review, model routing, caching, and retention cleanup so we can reduce waste without weakening the product experience.`,
    '',
    'Suggested next step: share the last 30 days of billing exports and usage logs so we can confirm the highest-impact changes and prioritize the implementation plan.',
    '',
    'Best,'
  ].join('\n');

  return {
    executiveSummary,
    savingsNarrative: `The estimated savings opportunity is strongest where high monthly spend overlaps with low usage, repeated model calls, long context windows, unused seats, or infrastructure data that grows without retention limits. Treat ${money(audit.possibleMonthlySavings)} as a working estimate until confirmed against real provider exports.`,
    actionPlan,
    implementationChecklist: checklist.slice(0, 8),
    clientEmail,
    disclaimer: 'This action pack is generated from audit inputs and simple cost signals. Validate recommendations with billing exports, usage logs, architecture review, and security requirements before promising savings.'
  };
};

const agentSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'confidence', 'quickWins', 'risks', 'questions', 'nextSteps', 'disclaimer'],
  properties: {
    summary: { type: 'string' },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
    quickWins: {
      type: 'array',
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'detail', 'impact'],
        properties: {
          title: { type: 'string' },
          detail: { type: 'string' },
          impact: { type: 'string', enum: ['Low', 'Medium', 'High'] }
        }
      }
    },
    risks: { type: 'array', maxItems: 4, items: { type: 'string' } },
    questions: { type: 'array', maxItems: 5, items: { type: 'string' } },
    nextSteps: { type: 'array', maxItems: 5, items: { type: 'string' } },
    disclaimer: { type: 'string' }
  }
};

const reportPackSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'executiveSummary',
    'savingsNarrative',
    'actionPlan',
    'implementationChecklist',
    'clientEmail',
    'disclaimer'
  ],
  properties: {
    executiveSummary: { type: 'string' },
    savingsNarrative: { type: 'string' },
    actionPlan: {
      type: 'array',
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['week', 'title', 'detail'],
        properties: {
          week: { type: 'string' },
          title: { type: 'string' },
          detail: { type: 'string' }
        }
      }
    },
    implementationChecklist: {
      type: 'array',
      maxItems: 8,
      items: { type: 'string' }
    },
    clientEmail: { type: 'string' },
    disclaimer: { type: 'string' }
  }
};

const extractOutputText = (data) => {
  if (data.output_text) return data.output_text;

  return (data.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || '')
    .filter(Boolean)
    .join('\n');
};

const siteChatFallback = (question) => {
  const text = cleanText(question, 600).toLowerCase();

  if (!text) {
    return 'Ask me about SpendGuard Audit, AI cost reports, CSV imports, budget alerts, security, early access, pricing, or how to start.';
  }

  if (/what|who|product|service|do you do|spendguard/.test(text)) {
    return 'SpendGuard Audit helps startups review AI API and infrastructure spend, find waste, and create action reports. It focuses on model costs, token usage, vector databases, cloud inference, logs, workflows, customers, budgets, and savings proof.';
  }

  if (/price|pricing|payment|pay|free|early|trial/.test(text)) {
    return 'SpendGuard is free for early users right now. Payment is still built into the product for future paid plans, but early users can create reports without checkout.';
  }

  if (/safe|security|password|api key|secret|data|privacy/.test(text)) {
    return 'SpendGuard does not need passwords, secret API keys, card details, or raw customer data for an audit. Start with invoices, billing screenshots, usage exports, tool names, monthly cost lines, request volume, token estimates, and workflow notes.';
  }

  if (/csv|upload|import|billing|export|ledger/.test(text)) {
    return 'You can paste or upload CSV billing rows. Useful headers include provider, service, monthly cost, workflow, customer, requests, tokens, owner, and budget. SpendGuard turns those rows into a cost ledger.';
  }

  if (/saving|reduce|cost|bill|waste|optimi/.test(text)) {
    return 'SpendGuard looks for waste like premium models used for simple tasks, repeated prompts, long context, missing caching, vector/log retention growth, no cost attribution, and missing budget limits. Savings are estimates until validated with real usage data.';
  }

  if (/report|pdf|share|client|link/.test(text)) {
    return 'SpendGuard creates an audit report with executive summary, waste findings, cost ledger, unit economics, action plan, budget alerts, and before/after savings tracking. You can export PDF or create a private public report link for clients.';
  }

  if (/start|signup|account|how/.test(text)) {
    return 'Start by creating a free early-access account, then create a new audit. Add company details, paste or upload billing rows, review the waste detector, and generate the report.';
  }

  return 'I can help with SpendGuard Audit questions: what it does, whether it is safe, how pricing works, how CSV import works, what the report includes, and how it reduces AI API and infrastructure costs.';
};

const callOpenAISiteChat = async ({ message, history }) => {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5',
      instructions: [
        'You are SpendGuard Website Assistant, a concise product-support assistant for SpendGuard Audit.',
        'Answer visitor questions about the product, early access, pricing, reports, CSV imports, cost ledger, budget alerts, unit economics, security, and how to start.',
        'Do not ask for passwords, API keys, card details, bank details, raw customer data, or private credentials.',
        'Do not invent case studies, guaranteed savings, certifications, or paid plan changes.',
        'If the question is outside SpendGuard or AI cost auditing, briefly redirect to SpendGuard-related help.',
        'Keep answers under 110 words and end with a useful next step when appropriate.'
      ].join(' '),
      input: JSON.stringify({
        message,
        recentConversation: history,
        productFacts: {
          product: 'SpendGuard Audit',
          focus: 'AI API and infrastructure cost audit for startups',
          access: 'Free for early users; payment remains built in for future paid plans',
          safeInputs: 'billing screenshots, invoices, usage exports, cost lines, request volume, token estimates, tool names, workflow notes',
          unsafeInputs: 'passwords, secret API keys, card details, bank details, raw customer records',
          features: 'CSV import, cost ledger, waste detector, budget alerts, unit economics, action plan, PDF export, private report links, confirmed savings tracking'
        }
      }),
      max_output_tokens: 260
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Site chat request failed');
  }

  return cleanText(extractOutputText(data), 900) || siteChatFallback(message);
};

router.post('/site-chat', async (req, res, next) => {
  try {
    const message = cleanText(req.body.message, 600);
    const history = Array.isArray(req.body.history)
      ? req.body.history.slice(-6).map((item) => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        content: cleanText(item.content, 500)
      })).filter((item) => item.content)
      : [];

    if (!message) {
      return res.status(400).json({ message: 'Ask a question before sending chat.' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        provider: 'rules',
        answer: siteChatFallback(message)
      });
    }

    try {
      const answer = await callOpenAISiteChat({ message, history });
      return res.json({ provider: 'openai', answer });
    } catch (error) {
      console.error('Site chat fallback used:', error.message);
      return res.json({
        provider: 'rules',
        answer: siteChatFallback(message)
      });
    }
  } catch (error) {
    next(error);
  }
});

const callOpenAIAgent = async (payload) => {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5',
      instructions: [
        'You are SpendGuard Audit Agent, a practical AI cost optimization analyst for startups.',
        'Analyze AI API, model usage, embeddings, vector database, cloud inference, observability, and workflow cost lines.',
        'Do not request passwords, secret API keys, private credentials, or raw customer personal data.',
        'Do not invent case studies or guaranteed savings. Give concrete audit questions and engineering-ready next steps.',
        'Return only structured JSON that follows the schema.'
      ].join(' '),
      input: JSON.stringify(payload),
      max_output_tokens: 1000,
      text: {
        format: {
          type: 'json_schema',
          name: 'spendguard_agent_response',
          strict: true,
          schema: agentSchema
        }
      }
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error?.message || 'AI agent request failed');
  }

  return JSON.parse(extractOutputText(data));
};

const callOpenAIReportPack = async (audit) => {
  const payload = {
    companyName: audit.companyName,
      businessType: audit.businessType,
      workspaceName: audit.workspaceName,
      productType: audit.productType,
    teamSize: audit.teamSize,
    monthlyActiveUsers: audit.monthlyActiveUsers,
      monthlyRequests: audit.monthlyRequests,
      monthlyBudget: audit.monthlyBudget,
      costConcern: audit.costConcern,
    notes: audit.notes,
    costLines: normalizeCostLines(audit.tools || []),
    monthlySpend: audit.monthlySpend,
    possibleMonthlySavings: audit.possibleMonthlySavings,
    spendAfterCleanup: audit.spendAfterCleanup,
    yearlySavings: audit.yearlySavings,
      riskLevel: audit.riskLevel,
      wasteFindings: audit.wasteFindings || [],
      budgetAlerts: audit.budgetAlerts || [],
      unitEconomics: audit.unitEconomics || {},
      actionPlan: audit.actionPlan || [],
    recommendations: audit.recommendations || []
  };

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5',
      instructions: [
        'You are SpendGuard Report Agent, an AI cost optimization operator for startups.',
        'Turn an audit into a useful business deliverable: executive summary, savings narrative, 30-day action plan, implementation checklist, and client follow-up email.',
        'Focus on real-world AI API, model routing, token usage, agent workflow, vector database, logs, cloud inference, and retention problems.',
        'Do not invent customer stories, fake benchmarks, guaranteed savings, secret access needs, or claims that cannot be verified.',
        'Return only structured JSON that follows the schema.'
      ].join(' '),
      input: JSON.stringify(payload),
      max_output_tokens: 1300,
      text: {
        format: {
          type: 'json_schema',
          name: 'spendguard_report_pack',
          strict: true,
          schema: reportPackSchema
        }
      }
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error?.message || 'AI report pack request failed');
  }

  return JSON.parse(extractOutputText(data));
};

router.use(requireAuth);

router.post('/audit-advice', requireActivePlan, async (req, res, next) => {
  try {
    const costLines = normalizeCostLines(req.body.tools || req.body.costLines || []);

    if (!costLines.length) {
      return res.status(400).json({ message: 'Add at least one AI cost line before asking the agent' });
    }

    const context = {
      companyName: cleanText(req.body.companyName, 120),
      businessType: cleanText(req.body.businessType, 120),
      workspaceName: cleanText(req.body.workspaceName, 120),
      productType: cleanText(req.body.productType, 120),
      teamSize: Math.max(1, Math.round(toNumber(req.body.teamSize) || 1)),
      monthlyActiveUsers: Math.max(0, Math.round(toNumber(req.body.monthlyActiveUsers))),
      monthlyRequests: Math.max(0, Math.round(toNumber(req.body.monthlyRequests))),
      monthlyBudget: Math.max(0, Math.round(toNumber(req.body.monthlyBudget))),
      targetSavingsRate: Math.max(0, Math.min(90, Math.round(toNumber(req.body.targetSavingsRate)))),
      costConcern: cleanText(req.body.costConcern, 800),
      agentFocus: cleanText(req.body.agentFocus, 80),
      dataSource: cleanText(req.body.dataSource, 160),
      hasCaching: normalizeControl(req.body.hasCaching),
      hasModelRouting: normalizeControl(req.body.hasModelRouting),
      hasUsageLimits: normalizeControl(req.body.hasUsageLimits),
      hasCostAttribution: normalizeControl(req.body.hasCostAttribution),
      notes: cleanText(req.body.notes, 800),
      costLines
    };

    const audit = calculateAudit({ tools: costLines, ...context });
    const fallbackAgent = buildRuleAgent({ ...context, audit });

    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        provider: 'rules',
        agent: fallbackAgent,
        audit
      });
    }

    try {
      const agent = await callOpenAIAgent({ ...context, calculatedAudit: audit });

      return res.json({
        provider: 'openai',
        agent: {
          ...fallbackAgent,
          ...agent,
          disclaimer: agent.disclaimer || fallbackAgent.disclaimer
        },
        audit
      });
    } catch (error) {
      console.error('AI agent fallback used:', error.message);
      return res.json({
        provider: 'rules',
        agent: fallbackAgent,
        audit
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post('/report-pack/:auditId', requireActivePlan, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.auditId)) {
      return res.status(404).json({ message: 'Audit not found' });
    }

    const audit = await Audit.findOne({
      _id: req.params.auditId,
      user: req.user._id
    });

    if (!audit) {
      return res.status(404).json({ message: 'Audit not found' });
    }

    const fallbackPack = buildRuleReportPack(audit);

    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        provider: 'rules',
        pack: fallbackPack
      });
    }

    try {
      const pack = await callOpenAIReportPack(audit);

      return res.json({
        provider: 'openai',
        pack: {
          ...fallbackPack,
          ...pack,
          disclaimer: pack.disclaimer || fallbackPack.disclaimer
        }
      });
    } catch (error) {
      console.error('AI report pack fallback used:', error.message);
      return res.json({
        provider: 'rules',
        pack: fallbackPack
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
