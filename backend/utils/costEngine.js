const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const cleanText = (value, fallback = '') =>
  String(value || fallback).trim();

const cleanChoice = (value, allowed, fallback) =>
  allowed.includes(value) ? value : fallback;

const money = (value) =>
  `Rs ${Math.round(Number(value || 0)).toLocaleString('en-IN')}`;

const isModelLine = (tool) =>
  /model|api|llm|openai|anthropic|claude|gemini|gpt|agent|copilot/i.test(`${tool.category} ${tool.name}`);

const isStorageLine = (tool) =>
  /vector|embedding|storage|log|trace|observability|monitor/i.test(`${tool.category} ${tool.name}`);

const groupSpend = (tools, key) =>
  tools.reduce((groups, tool) => {
    const groupName = cleanText(tool[key]) || '';
    if (!groupName) return groups;
    groups[groupName] = (groups[groupName] || 0) + tool.monthlyCost;
    return groups;
  }, {});

const topGroup = (groups) =>
  Object.entries(groups).sort((a, b) => b[1] - a[1])[0] || ['', 0];

const addFinding = (findings, finding) => {
  if (!finding.estimatedSavings || finding.estimatedSavings < 1) return;
  findings.push({
    ...finding,
    estimatedSavings: Math.round(finding.estimatedSavings)
  });
};

const cleanTools = (tools = []) =>
  tools
    .filter((tool) => cleanText(tool?.name))
    .map((tool) => ({
      name: cleanText(tool.name),
      provider: cleanText(tool.provider),
      modelName: cleanText(tool.modelName),
      workflow: cleanText(tool.workflow),
      customer: cleanText(tool.customer),
      monthlyCost: Math.max(0, toNumber(tool.monthlyCost)),
      seats: Math.max(1, Math.round(toNumber(tool.seats) || 1)),
      usage: cleanChoice(tool.usage, ['high', 'medium', 'low', 'unused'], 'medium'),
      category: cleanText(tool.category, 'Model API'),
      monthlyRequests: Math.max(0, Math.round(toNumber(tool.monthlyRequests))),
      avgTokens: Math.max(0, Math.round(toNumber(tool.avgTokens))),
      modelTier: cleanChoice(tool.modelTier, ['premium', 'balanced', 'economy', 'mixed', 'unknown'], 'unknown'),
      caching: cleanChoice(tool.caching, ['none', 'partial', 'good', 'unknown'], 'unknown'),
      owner: cleanText(tool.owner),
      department: cleanText(tool.department),
      region: cleanText(tool.region),
      costCenter: cleanText(tool.costCenter),
      budgetLimit: Math.max(0, toNumber(tool.budgetLimit))
    }));

const buildActionPlan = ({ findings, context, topTool }) => {
  const actions = [
    {
      phase: 'Week 1',
      title: 'Create the usage baseline',
      detail: 'Export the last 30 days of provider billing, request volume, token usage, embeddings, vector storage, logs, and background job costs.',
      owner: 'Founder or operations',
      status: 'todo'
    },
    {
      phase: 'Week 1',
      title: 'Tag spend by feature and customer',
      detail: 'Add cost attribution by customer, workspace, feature, or workflow before making deeper engineering changes.',
      owner: 'Engineering',
      status: 'todo'
    },
    {
      phase: 'Week 2',
      title: topTool
        ? `Fix the largest cost line: ${topTool.name}`
        : 'Fix the largest AI cost line',
      detail: 'Review prompt size, retries, duplicate calls, model choice, caching, and owner responsibility for the highest monthly spend.',
      owner: 'Engineering',
      status: 'todo'
    },
    {
      phase: 'Week 3',
      title: 'Add routing, caching, and usage limits',
      detail: 'Route simple tasks to cheaper models, cache repeated answers, trim context, and add usage limits for heavy workflows.',
      owner: 'Product and engineering',
      status: 'todo'
    },
    {
      phase: 'Week 4',
      title: 'Validate savings and monitor monthly',
      detail: 'Compare the new monthly baseline against this audit, record confirmed savings, and schedule a monthly cost review.',
      owner: 'Finance or founder',
      status: 'todo'
    }
  ];

  if (context.hasUsageLimits === 'no' || context.hasUsageLimits === 'unknown') {
    actions.splice(3, 0, {
      phase: 'Week 2',
      title: 'Set budget alerts before the next billing cycle',
      detail: 'Create provider-level and workflow-level budget alerts so fast-growing usage is caught before the invoice arrives.',
      owner: 'Operations',
      status: 'todo'
    });
  }

  if (findings.some((finding) => /retention|vector|log/i.test(finding.title))) {
    actions.splice(4, 0, {
      phase: 'Week 3',
      title: 'Add retention rules for stored AI data',
      detail: 'Define cleanup windows for vectors, logs, traces, generated artifacts, and test data that no longer support product value.',
      owner: 'Engineering',
      status: 'todo'
    });
  }

  return actions.slice(0, 7);
};

const calculateRiskLevel = ({ monthlySpend, possibleMonthlySavings, context, findings }) => {
  let score = 0;

  if (monthlySpend >= 50000) score += 2;
  else if (monthlySpend >= 15000) score += 1;

  if (possibleMonthlySavings >= monthlySpend * 0.3) score += 2;
  else if (possibleMonthlySavings >= monthlySpend * 0.15) score += 1;

  ['hasCaching', 'hasModelRouting', 'hasUsageLimits', 'hasCostAttribution'].forEach((key) => {
    if (context[key] === 'no') score += 1;
    if (context[key] === 'unknown') score += 0.5;
  });

  if (findings.some((finding) => finding.impact === 'High')) score += 1;

  if (score >= 5) return 'High';
  if (score >= 2.5) return 'Medium';
  return 'Low';
};

const calculateAudit = ({
  tools = [],
  teamSize = 1,
  monthlyActiveUsers = 0,
  monthlyRequests = 0,
  monthlyBudget = 0,
  targetSavingsRate = 0,
  hasCaching = 'unknown',
  hasModelRouting = 'unknown',
  hasUsageLimits = 'unknown',
  hasCostAttribution = 'unknown'
} = {}) => {
  const cleanCostLines = cleanTools(tools);
  const context = {
    teamSize: Math.max(1, Math.round(toNumber(teamSize) || 1)),
    monthlyActiveUsers: Math.max(0, Math.round(toNumber(monthlyActiveUsers))),
    monthlyRequests: Math.max(0, Math.round(toNumber(monthlyRequests))),
    monthlyBudget: Math.max(0, Math.round(toNumber(monthlyBudget))),
    targetSavingsRate: Math.max(0, Math.min(90, Math.round(toNumber(targetSavingsRate)))),
    hasCaching: cleanChoice(hasCaching, ['yes', 'partial', 'no', 'unknown'], 'unknown'),
    hasModelRouting: cleanChoice(hasModelRouting, ['yes', 'partial', 'no', 'unknown'], 'unknown'),
    hasUsageLimits: cleanChoice(hasUsageLimits, ['yes', 'partial', 'no', 'unknown'], 'unknown'),
    hasCostAttribution: cleanChoice(hasCostAttribution, ['yes', 'partial', 'no', 'unknown'], 'unknown')
  };

  const monthlySpend = cleanCostLines.reduce((sum, tool) => sum + tool.monthlyCost, 0);
  const derivedMonthlyRequests = context.monthlyRequests || cleanCostLines.reduce((sum, tool) => sum + tool.monthlyRequests, 0);
  const topTool = [...cleanCostLines].sort((a, b) => b.monthlyCost - a.monthlyCost)[0];
  const lowUsageSpend = cleanCostLines
    .filter((tool) => ['low', 'unused'].includes(tool.usage))
    .reduce((sum, tool) => sum + tool.monthlyCost, 0);
  const modelSpend = cleanCostLines
    .filter(isModelLine)
    .reduce((sum, tool) => sum + tool.monthlyCost, 0);
  const premiumModelSpend = cleanCostLines
    .filter((tool) => tool.modelTier === 'premium' || (isModelLine(tool) && tool.monthlyCost >= monthlySpend * 0.35))
    .reduce((sum, tool) => sum + tool.monthlyCost, 0);
  const noCacheSpend = cleanCostLines
    .filter((tool) => tool.caching === 'none' || tool.caching === 'unknown')
    .reduce((sum, tool) => sum + tool.monthlyCost, 0);
  const storageSpend = cleanCostLines
    .filter(isStorageLine)
    .reduce((sum, tool) => sum + tool.monthlyCost, 0);
  const highTokenSpend = cleanCostLines
    .filter((tool) => tool.avgTokens >= 4000)
    .reduce((sum, tool) => sum + tool.monthlyCost, 0);

  const duplicateEstimate = monthlySpend * 0.08;
  const wrongPlanEstimate = monthlySpend * 0.06;
  const teamSeatEstimate = Math.max(0, context.teamSize - 1) * 250;
  const routingEstimate = context.hasModelRouting === 'yes'
    ? premiumModelSpend * 0.06
    : premiumModelSpend * 0.2 + modelSpend * 0.04;
  const cachingEstimate = context.hasCaching === 'yes'
    ? noCacheSpend * 0.04
    : noCacheSpend * 0.15 + (derivedMonthlyRequests > 10000 ? modelSpend * 0.05 : 0);
  const attributionEstimate = context.hasCostAttribution === 'yes' ? 0 : monthlySpend * 0.06;
  const limitsEstimate = context.hasUsageLimits === 'yes' ? 0 : monthlySpend * 0.05;
  const retentionEstimate = storageSpend * 0.18;
  const tokenEstimate = highTokenSpend * 0.14;

  const rawSavings = lowUsageSpend * 0.65
    + duplicateEstimate
    + wrongPlanEstimate
    + teamSeatEstimate
    + routingEstimate
    + cachingEstimate
    + attributionEstimate
    + limitsEstimate
    + retentionEstimate
    + tokenEstimate;
  const possibleMonthlySavings = Math.round(Math.min(monthlySpend * 0.48, rawSavings));
  const spendAfterCleanup = Math.max(0, monthlySpend - possibleMonthlySavings);
  const yearlySavings = possibleMonthlySavings * 12;

  const wasteFindings = [];
  const budgetAlerts = [];

  if (context.monthlyBudget > 0 && monthlySpend > context.monthlyBudget) {
    budgetAlerts.push({
      title: 'Monthly budget exceeded',
      detail: `Current monthly spend is above the configured budget by ${money(monthlySpend - context.monthlyBudget)}.`,
      severity: 'High',
      currentSpend: monthlySpend,
      threshold: context.monthlyBudget
    });
  } else if (context.monthlyBudget > 0 && monthlySpend >= context.monthlyBudget * 0.85) {
    budgetAlerts.push({
      title: 'Monthly budget nearly reached',
      detail: 'Current monthly spend is above 85% of the configured budget. Review high-growth workflows before the invoice closes.',
      severity: 'Medium',
      currentSpend: monthlySpend,
      threshold: context.monthlyBudget
    });
  }

  cleanCostLines.forEach((tool) => {
    if (tool.budgetLimit > 0 && tool.monthlyCost > tool.budgetLimit) {
      budgetAlerts.push({
        title: `${tool.name} is over budget`,
        detail: `${tool.name} is ${money(tool.monthlyCost - tool.budgetLimit)} over its monthly budget limit.`,
        severity: tool.monthlyCost >= tool.budgetLimit * 1.25 ? 'High' : 'Medium',
        currentSpend: tool.monthlyCost,
        threshold: tool.budgetLimit
      });
    }
  });

  addFinding(wasteFindings, {
    title: 'Low-usage or unused spend',
    detail: 'Cost lines marked low or unused should be paused, capped, downgraded, or assigned to an owner before the next billing cycle.',
    category: 'Utilization',
    impact: lowUsageSpend >= monthlySpend * 0.25 ? 'High' : 'Medium',
    estimatedSavings: lowUsageSpend * 0.65
  });

  addFinding(wasteFindings, {
    title: 'Premium model overuse risk',
    detail: 'Simple extraction, formatting, classification, and summarization tasks may not need premium models on every request.',
    category: 'Model routing',
    impact: premiumModelSpend >= monthlySpend * 0.35 ? 'High' : 'Medium',
    estimatedSavings: routingEstimate
  });

  addFinding(wasteFindings, {
    title: 'Repeated work without caching',
    detail: 'Repeated prompts, duplicate requests, retries, and stable answers should be reviewed for caching or dedupe rules.',
    category: 'Caching',
    impact: noCacheSpend >= monthlySpend * 0.35 ? 'High' : 'Medium',
    estimatedSavings: cachingEstimate
  });

  addFinding(wasteFindings, {
    title: 'Long context and token waste',
    detail: 'Large average token counts suggest context can be trimmed, summarized, or split before repeated agent calls.',
    category: 'Token usage',
    impact: highTokenSpend >= monthlySpend * 0.25 ? 'High' : 'Medium',
    estimatedSavings: tokenEstimate
  });

  addFinding(wasteFindings, {
    title: 'Vector, log, and retention growth',
    detail: 'Embeddings, vector indexes, traces, logs, and generated artifacts need cleanup windows so storage does not grow silently.',
    category: 'Retention',
    impact: storageSpend >= monthlySpend * 0.25 ? 'High' : 'Medium',
    estimatedSavings: retentionEstimate
  });

  addFinding(wasteFindings, {
    title: 'Missing cost attribution',
    detail: 'Without customer, feature, or workflow cost tags, it is hard to know whether AI usage is profitable.',
    category: 'Measurement',
    impact: monthlySpend >= 15000 ? 'High' : 'Medium',
    estimatedSavings: attributionEstimate
  });

  addFinding(wasteFindings, {
    title: 'No budget guardrails',
    detail: 'Usage limits and budget alerts protect gross margin when a customer, agent, or workflow suddenly grows.',
    category: 'Controls',
    impact: monthlySpend >= 15000 ? 'High' : 'Medium',
    estimatedSavings: limitsEstimate
  });

  const recommendations = wasteFindings.slice(0, 5).map((finding) => ({
    title: finding.title,
    detail: `${finding.detail} Estimated monthly opportunity: ${money(finding.estimatedSavings)}.`,
    impact: finding.impact
  }));

  if (!recommendations.length) {
    recommendations.push({
      title: 'Start monthly AI usage tracking',
      detail: 'Track model API, embeddings, vector database, cloud inference, and observability spend every month.',
      impact: 'Medium'
    });
  }

  const actionPlan = buildActionPlan({ findings: wasteFindings, context, topTool });
  const riskLevel = calculateRiskLevel({ monthlySpend, possibleMonthlySavings, context, findings: wasteFindings });
  const workflowGroups = groupSpend(cleanCostLines, 'workflow');
  const customerGroups = groupSpend(cleanCostLines, 'customer');
  const [topWorkflow, topWorkflowCost] = topGroup(workflowGroups);
  const [topCustomer, topCustomerCost] = topGroup(customerGroups);
  const unattributedSpend = cleanCostLines
    .filter((tool) => !tool.workflow && !tool.customer)
    .reduce((sum, tool) => sum + tool.monthlyCost, 0);
  const unitEconomics = {
    costPerActiveUser: context.monthlyActiveUsers ? monthlySpend / context.monthlyActiveUsers : 0,
    costPerRequest: derivedMonthlyRequests ? monthlySpend / derivedMonthlyRequests : 0,
    topWorkflow,
    topWorkflowCost,
    topCustomer,
    topCustomerCost,
    unattributedSpend
  };

  return {
    tools: cleanCostLines,
    monthlySpend,
    possibleMonthlySavings,
    spendAfterCleanup,
    yearlySavings,
    riskLevel,
    wasteFindings: wasteFindings.sort((a, b) => b.estimatedSavings - a.estimatedSavings).slice(0, 7),
    budgetAlerts: budgetAlerts.slice(0, 8),
    unitEconomics,
    actionPlan,
    recommendations
  };
};

module.exports = { calculateAudit };
