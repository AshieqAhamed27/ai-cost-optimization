const express = require('express');
const { requireAuth, requireActivePlan } = require('../middleware/auth');
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
      category: cleanText(tool.category || 'Model API', 80),
      monthlyCost: Math.max(0, toNumber(tool.monthlyCost)),
      seats: Math.max(1, Math.round(toNumber(tool.seats) || 1)),
      usage: ['high', 'medium', 'low', 'unused'].includes(tool.usage) ? tool.usage : 'medium'
    }));

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
    summary: `${cleanText(companyName || businessType || 'This account', 80)} has ${money(audit.monthlySpend)} in monthly AI and infrastructure cost lines, with an estimated ${money(audit.possibleMonthlySavings)} monthly optimization opportunity.`,
    confidence: costLines.length >= 3 ? 'medium' : 'low',
    quickWins: quickWins.slice(0, 4),
    risks,
    questions,
    nextSteps,
    disclaimer: 'This is an audit assistant estimate. Confirm savings with real usage exports, logs, architecture review, and billing data before promising results.'
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

const extractOutputText = (data) => {
  if (data.output_text) return data.output_text;

  return (data.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || '')
    .filter(Boolean)
    .join('\n');
};

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
      teamSize: Math.max(1, Math.round(toNumber(req.body.teamSize) || 1)),
      notes: cleanText(req.body.notes, 800),
      costLines
    };

    const audit = calculateAudit({ tools: costLines, teamSize: context.teamSize });
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

module.exports = router;
